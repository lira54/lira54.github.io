if (typeof showdown != 'undefined') {

    var mdHelper = (function() {

        // more on extensions: https://github.com/showdownjs/showdown/wiki/Cookbook:-Using-language-and-output-extensions-on-the-same-block
        showdown.extension('newsExt', function() {
            return [{
                type: 'output',
                filter: function(text) {
                    text.replace(/<h2/gi, '<h2 class="mdl-typography--title"');
                    return text;
                }
            }]
        });

        var loadAsMarkdown = function(mdLink, elementId) {
            var container = document.getElementById(elementId);
            if (!container) return;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', mdLink, true);
            xhr.onreadystatechange = function() {
                if (this.readyState !== 4) return;
                if (this.status !== 200) return;
                // var converter = new showdown.Converter({
                //         extensions: ['newsExt']
                //     }),
                // html = converter.makeHtml(this.responseText);
                var converter = new showdown.Converter(),
                    html = converter.makeHtml(this.responseText);
                container.innerHTML = html;
            };
            xhr.send();
        }

        return {
            loadAsMarkdown: loadAsMarkdown
        }
    })();

} else {
    console.error('mdHelper requires showdownjs');
}
