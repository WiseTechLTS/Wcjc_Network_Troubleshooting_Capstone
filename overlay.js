document.addEventListener("DOMContentLoaded", function () {
    const scenes = document.querySelectorAll(".overlay-scene");
    let currentSceneIndex = 0;

    // Show a particular scene by adding the "active" class.
    function showScene(index) {
        if (index < 0 || index >= scenes.length) return;
        scenes.forEach((scene, i) => {
            if (i === index) {
                scene.classList.add("active");
            } else {
                scene.classList.remove("active");
            }
        });
        currentSceneIndex = index;
    }

    // Initially show the first scene.
    showScene(0);

    // Navigate to the next scene.
    window.nextScene = function () {
        if (currentSceneIndex < scenes.length - 1) {
            showScene(currentSceneIndex + 1);
        }
    };

    // Navigate to the previous scene.
    window.prevScene = function () {
        if (currentSceneIndex > 0) {
            showScene(currentSceneIndex - 1);
        }
    };

    // Toggle the fadeIn animation on the given element using Animate.css.
    window.toggleAnimation = function (elementId, effectClass) {
        const element = document.getElementById(elementId);
        // Remove Animate.css classes to reset the animation.
        element.classList.remove("animate__animated", "animate__fadeIn");
        // Force a reflow to allow the animation to restart.
        void element.offsetWidth;
        // Add the Animate.css classes to start the animation.
        element.classList.add("animate__animated", effectClass);
    };
});
