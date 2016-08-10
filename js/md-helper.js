if (typeof showdown != 'undefined' && typeof Q != 'undefined') {

    var mdHelper = (function() {

        // // more on extensions: https://github.com/showdownjs/showdown/wiki/Cookbook:-Using-language-and-output-extensions-on-the-same-block
        // showdown.extension('newsExt', function() {
        //     return [{
        //         type: 'output',
        //         filter: function(text) {
        //             text.replace(/<h2/gi, '<h2 class="mdl-typography--title"');
        //             return text;
        //         }
        //     }]
        // });

        var obj = {

        }
        obj.loadAsMarkdown = function(mdLink, elementId) {
            var container = document.getElementById(elementId);
            if (!container) return;

            var xhr = new XMLHttpRequest();
            var result = Q.defer();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    var converter = new showdown.Converter(),
                        html = converter.makeHtml(this.responseText);
                    container.innerHTML = html;
                    result.resolve();
                }
            };
            xhr.open('GET', mdLink, true);
            xhr.send();
            return result.promise;
        };

        obj.load = function(url) {
            var xhr = new XMLHttpRequest();
            var deferred = Q.defer();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    deferred.resolve(this.responseText);
                }
            };
            xhr.open('GET', url, true);
            xhr.send();
            return deferred.promise;
        };

        obj.converter = function(extensions) {
            return new showdown.Converter({
                extensions: extensions
            });
        };

        return obj;

    })();

} else {
    console.error('mdHelper requires showdownjs, Q');
}
