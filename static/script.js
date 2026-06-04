document.addEventListener('DOMContentLoaded', () => {
    // 1. Mouse Parallax Effect
    const layers = document.querySelectorAll('.layer');
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2) / 100;
        const y = (e.clientY - window.innerHeight / 2) / 100;
        
        layers.forEach((layer, index) => {
            const speed = (index + 1) * 2;
            layer.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    // 2. Generate Background Particles
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 5 + 2;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 10;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}vw`;
        particle.style.top = `${top}vh`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        particlesContainer.appendChild(particle);
    }

    // 3. Random Plant Facts
    const facts = [
        "Did you know? Bamboo is the fastest-growing woody plant in the world; it can grow up to 35 inches in a single day!",
        "Did you know? The smell of freshly cut grass is actually a plant distress call.",
        "Did you know? 85% of plant life is found in the ocean.",
        "Did you know? The oldest living tree is over 4,800 years old, located in California.",
        "Did you know? Sunflowers track the sun across the sky in a process called heliotropism.",
        "Did you know? Caffeine developed in plants as a natural insecticide to paralyze and kill bugs."
    ];
    
    const randomFactEl = document.getElementById('random-fact');
    randomFactEl.textContent = facts[Math.floor(Math.random() * facts.length)];

    // 4. Form Submission and API Call
    const form = document.getElementById('search-form');
    const input = document.getElementById('plant-input');
    const loadingState = document.getElementById('loading-state');
    const resultSection = document.getElementById('result-section');
    const surpriseSection = document.getElementById('surprise-section');
    const resetBtn = document.getElementById('reset-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const plantName = input.value.trim();
        if (!plantName) return;

        // UI Transitions
        form.querySelector('button').disabled = true;
        surpriseSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        loadingState.classList.remove('hidden');

        try {
            const response = await fetch('/api/plant-care', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plant_name: plantName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch plant care data');
            }

            // Populate Results
            document.getElementById('result-title').textContent = data.plantName || plantName;
            document.getElementById('result-overview').textContent = data.overview || 'Overview not available.';
            document.getElementById('res-watering').textContent = data.watering || 'N/A';
            document.getElementById('res-sunlight').textContent = data.sunlight || 'N/A';
            document.getElementById('res-soil').textContent = data.soil || 'N/A';
            document.getElementById('res-fertilizer').textContent = data.fertilizer || 'N/A';
            document.getElementById('res-diseases').textContent = data.diseases || 'N/A';
            document.getElementById('res-tips').textContent = data.tips || 'N/A';

            // Show Results
            loadingState.classList.add('hidden');
            resultSection.classList.remove('hidden');

            // Scroll to results smoothly
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            alert(error.message);
            loadingState.classList.add('hidden');
            surpriseSection.classList.remove('hidden');
        } finally {
            form.querySelector('button').disabled = false;
        }
    });

    // 5. Reset Button
    resetBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        surpriseSection.classList.remove('hidden');
        input.value = '';
        input.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
