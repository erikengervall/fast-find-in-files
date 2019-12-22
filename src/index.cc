#include <string>

#include <napi.h>
#include "superSearch.h"

Napi::String superSearchNapi(const Napi::CallbackInfo &info) {
    std::string rootDirName = info[0].ToString();
    std::string userQuery = info[1].ToString();
    std::string result = superSearch(rootDirName, userQuery.c_str());

    return Napi::String::New(info.Env(), result);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "superSearch"),
                Napi::Function::New(env, superSearchNapi));
    return exports;
}

NODE_API_MODULE(superSearch, Init)