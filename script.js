document.addEventListener("DOMContentLoaded", function() {
    // Select all sections within main.
    const sections = document.querySelectorAll("main > section");
    let currentSectionIndex = 0;
  
    // Function to toggle the fadeIn animation on a given element using Animate.css.
    window.toggleAnimation = function(elementId, effectClass) {
      const element = document.getElementById(elementId);
      // Remove previous Animate.css classes.
      element.classList.remove("animate__animated", "animate__fadeIn");
      // Force reflow to allow the animation to re-trigger.
      void element.offsetWidth;
      // Add the Animate.css classes to start the animation.
      element.classList.add("animate__animated", effectClass);
    };
  
    // Function to smoothly scroll to a specified section.
    function scrollToSection(index) {
      if (index >= 0 && index < sections.length) {
        sections[index].scrollIntoView({ behavior: "smooth" });
        currentSectionIndex = index;
      }
    }
  
    // Navigate to the next scene.
    window.nextScene = function() {
      if (currentSectionIndex < sections.length - 1) {
        scrollToSection(currentSectionIndex + 1);
      }
    };
  
    // Navigate to the previous scene.
    window.prevScene = function() {
      if (currentSectionIndex > 0) {
        scrollToSection(currentSectionIndex - 1);
      }
    };
  
    // Update the current section index based on scroll position.
    document.addEventListener("scroll", () => {
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight) {
          currentSectionIndex = index;
        }
      });
    });
  });
  