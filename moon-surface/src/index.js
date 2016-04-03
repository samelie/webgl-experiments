import Moon from './moon';
var options = {
    useWebgl: true,
    width: window.innerWidth,
    height: window.innerHeight,
    panoOptions: {
        draggable: true,
        disableDefaultUI: true,
    }
}

window.onload = () => {
    var element = document.getElementById('pano');
    const moon = new Moon(element, options);
}