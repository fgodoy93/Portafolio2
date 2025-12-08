document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("miModal");
    const iframe = document.getElementById("miIframe");
    const closeBtn = document.querySelector(".close");
    const contenedorProyectos = document.getElementById("contenedorProyectos");
    const errorProyectos = document.getElementById("errorProyectos");

    // ============================================
    // FUNCIONES MODAL
    // ============================================
    
    function abrirModal(url) {
        iframe.src = url;
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevenir scroll del body
    }

    function cerrarModal() {
        iframe.src = "";
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Restaurar scroll
    }

    // Eventos para cerrar modal
    closeBtn.onclick = cerrarModal;
    
    window.onclick = function (event) {
        if (event.target === modal) {
            cerrarModal();
        }
    };

    // Cerrar modal con tecla ESC
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            cerrarModal();
        }
    });

    // ============================================
    // CARGAR PROYECTOS DESDE JSON
    // ============================================
    
    fetch("assets/js/proyectos.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los proyectos');
            }
            return response.json();
        })
        .then(data => {
            // Verificar que existen proyectos
            if (!data.proyectos || data.proyectos.length === 0) {
                throw new Error('No hay proyectos disponibles');
            }

            // Crear cards de proyectos
            data.proyectos.forEach((proyecto, index) => {
                const col = document.createElement("div");
                col.className = "col-md-6 col-lg-4 mb-4";
                col.style.opacity = "0";
                col.style.transform = "translateY(30px)";

                col.innerHTML = `
                    <div class="card h-100">
                        <img src="${proyecto.imagen}" 
                             class="card-img-top" 
                             alt="Captura de pantalla del proyecto ${proyecto.nombre}"
                             loading="lazy">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${proyecto.nombre}</h5>
                            <p class="card-text flex-grow-1">${proyecto.descripcion}</p>
                            <button class="btn btn-primary abrirModalBtn mt-auto" 
                                    data-url="${proyecto.url}"
                                    aria-label="Ver proyecto ${proyecto.nombre}">
                                Ver Proyecto
                            </button>
                        </div>
                    </div>
                `;

                contenedorProyectos.appendChild(col);

                // Animación de entrada escalonada
                setTimeout(() => {
                    col.style.transition = "all 0.6s ease";
                    col.style.opacity = "1";
                    col.style.transform = "translateY(0)";
                }, index * 100);
            });

            // Agregar eventos a los botones después de crear las cards
            document.querySelectorAll(".abrirModalBtn").forEach(btn => {
                btn.addEventListener("click", function () {
                    const url = this.getAttribute("data-url");

                    // Detectar tamaño de pantalla
                    if (window.innerWidth < 768) {
                        // En móvil redirige directamente
                        window.open(url, '_blank');
                    } else {
                        // En escritorio abre el modal
                        abrirModal(url);
                    }
                });
            });
        })
        .catch(error => {
            console.error("Error al cargar proyectos:", error);
            
            // Mostrar mensaje de error al usuario
            errorProyectos.classList.remove("d-none");
            contenedorProyectos.innerHTML = '';
        });

    // ============================================
    // SMOOTH SCROLL PARA NAVEGACIÓN
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignorar # solo
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Cerrar navbar en móvil después de hacer click
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
            }
        });
    });

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Agregar sombra al navbar al hacer scroll
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
            navbar.style.backgroundColor = 'rgba(10, 25, 47, 0.95)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.backgroundColor = 'var(--color-bg-primary)';
        }
        
        lastScroll = currentScroll;
    });

    // ============================================
    // INTERSECTION OBSERVER PARA ANIMACIONES
    // ============================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar secciones para animaciones
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // ============================================
    // ACTIVE LINK EN NAVBAR
    // ============================================
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // ============================================
    // PRELOAD IMAGES OPTIMIZATION
    // ============================================
    
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});