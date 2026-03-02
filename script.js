// A list of the different sections/apps you want to show
const items = [
    { title: "Projects", desc: "Cool things I've built." },
    { title: "Photos", desc: "Snapshots from my life." },
    { title: "Thoughts", desc: "A place for my random ideas." },
    { title: "Tools", desc: "Useful links and resources." }
];

const container = document.getElementById('collection');

// Function to display the items
function loadItems() {
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
        `;
        container.appendChild(card);
    });
}

// Interaction for the button
document.getElementById('exploreBtn').addEventListener('click', () => {
    window.scrollTo({
        top: container.offsetTop - 50,
        behavior: 'smooth'
    });
});

// Run the function when the page loads
window.onload = loadItems;