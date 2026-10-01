#include <napi.h>

#include <exception>
#include <functional>
#include <string>
#include <utility>
#include <vector>

#include "search.h"

namespace {

// The JS layer validates options before calling in, so the shape here is trusted.
WalkOptions parseWalkOptions(const Napi::Object& input) {
    WalkOptions options;
    options.directory = input.Get("directory").As<Napi::String>().Utf8Value();
    options.includeHidden = input.Get("includeHidden").As<Napi::Boolean>().Value();

    Napi::Array excludePaths = input.Get("excludePaths").As<Napi::Array>();
    for (uint32_t i = 0; i < excludePaths.Length(); i++) {
        options.excludePaths.push_back(excludePaths.Get(i).As<Napi::String>().Utf8Value());
    }

    Napi::Array excludePatterns = input.Get("excludePatterns").As<Napi::Array>();
    for (uint32_t i = 0; i < excludePatterns.Length(); i++) {
        Napi::Object pattern = excludePatterns.Get(i).As<Napi::Object>();
        options.excludePatterns.push_back({pattern.Get("source").As<Napi::String>().Utf8Value(),
                                           pattern.Get("ignoreCase").As<Napi::Boolean>().Value()});
    }

    return options;
}

std::string parseNeedle(const Napi::Object& input) { return input.Get("needle").As<Napi::String>().Utf8Value(); }

Napi::Value toJs(Napi::Env env, const std::vector<std::string>& files) {
    Napi::Array output = Napi::Array::New(env, files.size());
    for (std::size_t i = 0; i < files.size(); i++) output[i] = Napi::String::New(env, files[i]);
    return output;
}

Napi::Value toJs(Napi::Env env, const std::vector<Result>& results) {
    Napi::Array output = Napi::Array::New(env, results.size());

    for (std::size_t r = 0; r < results.size(); r++) {
        const Result& result = results[r];

        // One JS string per line, shared by every hit on it, so a long minified line is not copied per hit. Held as
        // napi_value because Object::Set converts a Napi::String back into a std::string and makes a new copy.
        std::vector<napi_value> lines;
        lines.reserve(result.lines.size());
        for (const Line& line : result.lines) lines.push_back(Napi::String::New(env, line.text));

        Napi::Array queryHits = Napi::Array::New(env, result.hits.size());
        for (std::size_t h = 0; h < result.hits.size(); h++) {
            const Hit& hit = result.hits[h];
            const Line& line = result.lines[hit.lineIndex];

            Napi::Object queryHit = Napi::Object::New(env);
            // Editors read the column in `path:line:column` as 1-based.
            queryHit.Set("link", result.filePath + ":" + std::to_string(line.number) + ":" +
                                     std::to_string(hit.offset + 1));
            queryHit.Set("line", lines[hit.lineIndex]);
            queryHit.Set("lineNumber", line.number);
            queryHit.Set("offset", static_cast<double>(hit.offset));
            queryHits[h] = queryHit;
        }

        Napi::Object file = Napi::Object::New(env);
        file.Set("filePath", result.filePath);
        file.Set("totalHits", static_cast<double>(result.hits.size()));
        file.Set("queryHits", queryHits);
        output[r] = file;
    }

    return output;
}

// Runs `work` on a libuv worker thread and settles a Promise with its converted output.
template <typename Output>
class Worker : public Napi::AsyncWorker {
   public:
    Worker(Napi::Env env, std::function<Output()> work)
        : Napi::AsyncWorker(env, "fastFindInFiles"),
          work_(std::move(work)),
          deferred_(Napi::Promise::Deferred::New(env)) {}

    Napi::Promise Promise() { return deferred_.Promise(); }

   protected:
    // Must not touch any N-API value: it runs off the main thread.
    void Execute() override {
        try {
            output_ = work_();
        } catch (const std::exception& error) {
            SetError(error.what());
        }
    }

    void OnOK() override { deferred_.Resolve(toJs(Env(), output_)); }

    void OnError(const Napi::Error& error) override { deferred_.Reject(error.Value()); }

   private:
    std::function<Output()> work_;
    Output output_;
    Napi::Promise::Deferred deferred_;
};

template <typename Output>
Napi::Value runSync(Napi::Env env, const std::function<Output()>& work) {
    try {
        return toJs(env, work());
    } catch (const std::exception& error) {
        Napi::Error::New(env, error.what()).ThrowAsJavaScriptException();
        return env.Undefined();
    }
}

template <typename Output>
Napi::Value runAsync(Napi::Env env, std::function<Output()> work) {
    auto* worker = new Worker<Output>(env, std::move(work));
    Napi::Promise promise = worker->Promise();
    worker->Queue();  // The worker deletes itself once it settles
    return promise;
}

std::function<std::vector<std::string>()> listFilesWork(const Napi::CallbackInfo& info) {
    WalkOptions options = parseWalkOptions(info[0].As<Napi::Object>());
    return [options]() { return listFiles(options); };
}

std::function<std::vector<Result>()> searchTextWork(const Napi::CallbackInfo& info) {
    Napi::Object input = info[0].As<Napi::Object>();
    WalkOptions options = parseWalkOptions(input);
    std::string needle = parseNeedle(input);
    return [options, needle]() { return searchText(options, needle); };
}

Napi::Value ListFiles(const Napi::CallbackInfo& info) { return runSync(info.Env(), listFilesWork(info)); }
Napi::Value ListFilesAsync(const Napi::CallbackInfo& info) { return runAsync(info.Env(), listFilesWork(info)); }
Napi::Value SearchText(const Napi::CallbackInfo& info) { return runSync(info.Env(), searchTextWork(info)); }
Napi::Value SearchTextAsync(const Napi::CallbackInfo& info) { return runAsync(info.Env(), searchTextWork(info)); }

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("listFiles", Napi::Function::New(env, ListFiles));
    exports.Set("listFilesAsync", Napi::Function::New(env, ListFilesAsync));
    exports.Set("searchText", Napi::Function::New(env, SearchText));
    exports.Set("searchTextAsync", Napi::Function::New(env, SearchTextAsync));
    return exports;
}

}  // namespace

NODE_API_MODULE(fast_find_in_files, Init)
