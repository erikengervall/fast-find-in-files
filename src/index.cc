#include <iostream>
#include <string>

#include <napi.h>

#include "superSearch.h"

Napi::Array transform(std::vector<Result>& results, Napi::Env env) {
    Napi::Array resultsAsNapi = Napi::Array::New(env, results.size());

    for (std::size_t i = 0; i < results.size(); i++) {
        Result result = results[i];
        std::vector<QueryHit> queryHits = result.queryHits;
        Napi::Array queryHitsAsNapi = Napi::Array::New(env, queryHits.size());

        Napi::Object resultAsNapi = Napi::Object::New(env);
        resultAsNapi.Set(Napi::String::New(env, "filePath"), result.filePath);
        resultAsNapi.Set(Napi::String::New(env, "totalHits"), result.totalHits);
        resultAsNapi.Set(Napi::String::New(env, "queryHits"), queryHitsAsNapi);

        resultsAsNapi[i] = resultAsNapi;

        for (std::size_t i = 0; i < queryHits.size(); i++) {
            QueryHit queryHit = queryHits[i];

            Napi::Object queryHitAsNapi = Napi::Object::New(env);
            queryHitAsNapi.Set(Napi::String::New(env, "link"), queryHit.link);
            queryHitAsNapi.Set(Napi::String::New(env, "line"), queryHit.line);
            queryHitAsNapi.Set(Napi::String::New(env, "lineNumber"), queryHit.lineNumber);
            queryHitAsNapi.Set(Napi::String::New(env, "offset"), queryHit.offset);

            queryHitsAsNapi[i] = queryHitAsNapi;
        }
    }

    return resultsAsNapi;
};

Napi::Array napiFunc(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string rootDirName = info[0].ToString();
    std::string userQuery = info[1].ToString();

    std::vector<Result> results = superSearch(rootDirName, userQuery.c_str());
    Napi::Array resultsAsNapi = transform(results, env);

    return resultsAsNapi;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "exportedFn"), Napi::Function::New(env, napiFunc));

    return exports;
}

NODE_API_MODULE(exportedFn, Init)
