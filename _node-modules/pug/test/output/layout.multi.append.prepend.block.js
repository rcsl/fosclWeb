function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<p class="last prepend">Last prepend must appear at top</p><p class="first prepend">Something prepended to content</p><div class="content">Defined content</div><p class="first append">Something appended to content</p><p class="last append">Last append must be most last</p><script src="foo.js"></script><script src="/app.js"></script><script src="jquery.js"></script>';
    return pug_html;
}