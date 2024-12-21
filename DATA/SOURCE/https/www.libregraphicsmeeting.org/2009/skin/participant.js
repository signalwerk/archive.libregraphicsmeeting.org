/** make sure getElementsByClassName() does exist */
function ensure_getElementsByClassName() {
    if (document.getElementsByClassName == undefined) {
        document.getElementsByClassName = function(className)
        {
            var hasClassName = new RegExp("(?:^|\\s)" + className + "(?:$|\\s)");
            var allElements = document.getElementsByTagName("*");
            var results = [];

            var element;
            for (var i = 0; (element = allElements[i]) != null; i++) {
                var elementClass = element.className;
                if (elementClass && elementClass.indexOf(className) != -1 && hasClassName.test(elementClass))
                    results.push(element);
            }

            return results;
        }
    }
}
window.addEventListener('load',ensure_getElementsByClassName,false);

function popup_alt() {
    alert(this.alt);
}

function enable_popup_alt() {
    element = document.getElementsByClassName("info");
    for (i = 0; i < element.length; i++) {
        // alert(element[i].alt);
        element[i].addEventListener('click',popup_alt,false);
    }
}

