document.addEventListener('DOMContentLoaded', () => {
    const catsPanel = document.getElementById('cats-results');
    const dogsPanel = document.getElementById('dogs-results');
    const catsPercentageSpan = document.getElementById('cats-percentage');
    const dogsPercentageSpan = document.getElementById('dogs-percentage');
    const catsCountSpan = document.getElementById('cats-count');
    const dogsCountSpan = document.getElementById('dogs-count');
    const totalVotesSpan = document.getElementById('total-votes');
    const errorSpan = document.getElementById('error-message');

    const updateInterval = 2000; // Update every 2 seconds

    function formatPercentage(value) {
        if (isNaN(value) || value === null || value === undefined) {
            return '0.0%';
        }
        return value.toFixed(1) + '%';
    }

    function updateUI(data) {
        // Validate received data
        if (!data || typeof data.cats === 'undefined' || typeof data.dogs === 'undefined') {
            console.error("Invalid data received:", data);
            errorSpan.textContent = 'Error receiving data from server.';
            // Reset UI to defaults
            catsPanel.style.opacity = '1'; // Ensure panels are visible on error/reset
            dogsPanel.style.opacity = '1';
            catsPanel.style.flexBasis = '50%';
            dogsPanel.style.flexBasis = '50%';
            catsPercentageSpan.textContent = '--%';
            dogsPercentageSpan.textContent = '--%';
            catsCountSpan.textContent = '(- votes)';
            dogsCountSpan.textContent = '(- votes)';
            totalVotesSpan.textContent = 'Total Votes: --';
            return;
        }

        errorSpan.textContent = ''; // Clear previous errors

        const catPercent = data.cats.percentage || 0;
        const dogPercent = data.dogs.percentage || 0;
        const catCount = data.cats.count || 0;
        const dogCount = data.dogs.count || 0;
        const total = data.total || 0;

        // Calculate flex-basis percentages
        let catFlex = catPercent;
        let dogFlex = dogPercent;

        if (total === 0) {
            // If total is 0, make it 50/50 visually
            catFlex = 50;
            dogFlex = 50;
        } else {
            // If total > 0, set flex basis directly from percentage
            catFlex = catPercent;
            dogFlex = dogPercent;
        }

        // Apply flex-basis for width adjustment
        catsPanel.style.flexBasis = `${catFlex}%`;
        dogsPanel.style.flexBasis = `${dogFlex}%`;

        // --- Adjust Opacity based on Count ---
        // Fade out the panel if its count is 0 (and total > 0)
        catsPanel.style.opacity = (catCount === 0 && total > 0) ? '0' : '1';
        dogsPanel.style.opacity = (dogCount === 0 && total > 0) ? '0' : '1';
        // --- End of Opacity Change ---


        // Update text content
        catsPercentageSpan.textContent = formatPercentage(catPercent);
        dogsPercentageSpan.textContent = formatPercentage(dogPercent);
        catsCountSpan.textContent = `(${catCount} vote${catCount !== 1 ? 's' : ''})`;
        dogsCountSpan.textContent = `(${dogCount} vote${dogCount !== 1 ? 's' : ''})`;
        totalVotesSpan.textContent = `Total Votes: ${total}`;
    }

    async function fetchResults() {
        console.log("Fetching results...");
        try {
            const response = await fetch('/results');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Received data:", data);
            updateUI(data);
        } catch (error) {
            console.error('Error fetching results:', error);
            errorSpan.textContent = 'Failed to load results. Retrying...';
             // Pass null to trigger error handling in updateUI
             updateUI(null);
        }
    }

    // Initial fetch when page loads
    fetchResults();

    // Set interval to fetch results periodically
    setInterval(fetchResults, updateInterval);
});