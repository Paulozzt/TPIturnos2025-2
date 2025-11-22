document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navWrapper = document.querySelector('.nav-links-wrapper');


    hamburger.addEventListener('click', () => {

        navWrapper.classList.toggle('active');

        const icon = hamburger.querySelector('i');
        if (navWrapper.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    navWrapper.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navWrapper.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });
});