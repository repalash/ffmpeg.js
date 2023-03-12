  return __ffmpegjs_return;
}

var __ffmpegjs_running = false;

// Shim for nodejs
if (typeof self === "undefined") {
    self = require("worker_threads")["parentPort"];
}

let files = [];

self.onmessage = function (e) {
    const msg = e.data;
    if (msg["type"] === "image") {
        msg.file.data = msg.file.data.arrayBuffer();
        files.push(msg.file);
    }
    if (msg["type"] === "run") {
        if (__ffmpegjs_running) {
            self.postMessage({type: "error", data: "already running"});
        } else {
            __ffmpegjs_running = true;
            self.postMessage({type: "run"});
            var opts = {};
            Object.keys(msg).forEach(function (key) {
                if (key !== "type") {
                    opts[key] = msg[key]
                }
            });
            opts["print"] = function(line) {
                self.postMessage({type: "stdout", data: line});
            };
            opts["printErr"] = function(line) {
                self.postMessage({type: "stderr", data: line});
            };
            opts["onExit"] = function(code) {
                self.postMessage({type: "exit", data: code});
            };
            opts["onAbort"] = function(reason) {
                self.postMessage({type: "abort", data: reason});
            };
            Promise.all(files.map((f) => f.data)).then((array) => {
                if(!opts["MEMFS"]) opts["MEMFS"] = [];
                files.forEach(function (f, i) {
                    opts["MEMFS"].push({name: f.name, data: array[i]})
                })
                files = [];
                try {
                    const result = __ffmpegjs(opts);
                    const transfer = result["MEMFS"].map(function (file) {
                        return file["data"].buffer;
                    });
                    self.postMessage({type: "done", data: result}, transfer);
                } catch (e) {
                    self.postMessage({type: "error", data: e.message});
                }
                __ffmpegjs_running = false;
            })
        }
    } else {
        self.postMessage({type: "error", data: "unknown command"});
    }
};

