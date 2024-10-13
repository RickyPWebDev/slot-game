document.addEventListener('DOMContentLoaded', function () {
    // Array of symbols for the slot machine
    const symbols = ['🍒', '🍋', '🍊', '⭐', '🍀', '🍒', '🍋', '🍒', '🍔', '🥙',
        '🍉', '🥥', '🍋‍🟩', '🍑', '🥭', '🥝', '🍐', '🫐', '🎰'];
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result');
    const balanceDisplay = document.getElementById('balance');
    const spinSound = document.getElementById('spin-sound'); // Get the audio element
    const winSound = document.getElementById('win-sound'); // Get the win sound audio element
    const backgroundMusic = document.getElementById('background-music'); // Get the background music audio element

    // Set sound volume to maximum
    spinSound.volume = 1.0; // Maximum volume (1.0 is full volume)
    winSound.volume = 1.0; // Maximum volume (1.0 is full volume)

    let balance = 1000; // Initial balance
    let totalSpins = 0; // Count of total spins
    let wins = 0; // Count of wins
    let musicPlayed = false; // Flag to check if music has been played

    // Function to generate a random symbol
    function getRandomSymbol() {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        return symbols[randomIndex];
    }

    // Function to get selected bet amount
    function getSelectedBet() {
        const betOptions = document.getElementsByName('bet');
        for (const bet of betOptions) {
            if (bet.checked) {
                return parseInt(bet.value); // Return selected bet as a number
            }
        }
        return 1; // Default to £1 if none are selected
    }

    // Function to play background music
    function playBackgroundMusic() {
        backgroundMusic.currentTime = 0; // Rewind to start
        backgroundMusic.volume = 0.5; // Set volume (adjust as needed)
        backgroundMusic.play().catch(error => {
            console.error('Failed to play background music:', error);
        });
    }

    // Function to show card selection modal and randomize cards
    function showCardSelection() {
        const modal = document.getElementById('card-modal');
        modal.style.display = 'block'; // Show the modal

        const cards = document.querySelectorAll('.card');
        shuffleCards(cards); // Shuffle the cards when the modal is shown

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const winAmount = parseInt(card.getAttribute('data-win'));
                handleCardSelection(winAmount);
                modal.style.display = 'none'; // Close the modal after selection
            });
        });
    }

    // Function to shuffle cards
    function shuffleCards(cards) {
        const cardContainer = document.querySelector('.card-container');
        const cardArray = Array.from(cards);

        // Fisher-Yates Shuffle
        for (let i = cardArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]];
        }

        // Clear the card container and append shuffled cards
        cardContainer.innerHTML = '';
        cardArray.forEach(card => {
            cardContainer.appendChild(card);
        });
    }

    // Function to handle the outcome after card selection
    function handleCardSelection(winAmount) {
        const betAmount = getSelectedBet();
        let totalWin;

        if (winAmount === 0) {
            resultDisplay.textContent = 'You have selected a card with no win!';
            totalWin = 0;
        } else {
            totalWin = betAmount * winAmount;
            resultDisplay.textContent = `Congratulations! You won £${totalWin}`;
        }

        // Update balance
        balance += totalWin;
        balanceDisplay.textContent = `Balance: £${balance}`;
    }

    // Function to spin the slots
    function spinSlots() {
        const betAmount = getSelectedBet(); // Get the selected bet amount
        spinButton.style.display = 'none'; // Hide the spin button at the start of the spin

        if (balance <= 0) {
            resultDisplay.textContent = "You are out of balance!";
            spinButton.style.display = 'inline-block'; // Show the spin button again
            return;
        }

        if (balance < betAmount) {
            resultDisplay.textContent = "Insufficient balance!";
            spinButton.style.display = 'inline-block'; // Show the spin button again
            return;
        }

        // Play sound effect immediately when spin button is clicked
        spinSound.currentTime = 0; // Rewind to start
        spinSound.volume = 1.0;     // Ensure volume is maximum
        spinSound.play().catch(error => {
            console.error('Failed to play spin sound:', error);
        });

        // Play background music the first time the user spins
        if (!musicPlayed) {
            playBackgroundMusic();
            musicPlayed = true; // Set the flag to true to prevent multiple calls
        }

        // Deduct the cost of spinning
        balance -= betAmount; // Cost per spin
        balanceDisplay.textContent = `Balance: £${balance}`; // Update balance display

        // Increment total spins
        totalSpins++;

        const slot1 = document.getElementById('slot1');
        const slot2 = document.getElementById('slot2');
        const slot3 = document.getElementById('slot3');

        // Number of spins before landing
        const spins = 5; // Number of spins
        let currentSpin = 0;

        // Spin the slots multiple times
        const interval = setInterval(() => {
            slot1.textContent = getRandomSymbol();
            slot2.textContent = getRandomSymbol();
            slot3.textContent = getRandomSymbol();
            currentSpin++;

            if (currentSpin >= spins) {
                clearInterval(interval);

                // Final symbols after the spins
                setTimeout(() => {
                    const finalSymbol1 = getRandomSymbol();
                    const finalSymbol2 = getRandomSymbol();
                    const finalSymbol3 = getRandomSymbol();
                    slot1.textContent = finalSymbol1;
                    slot2.textContent = finalSymbol2;
                    slot3.textContent = finalSymbol3;

                    // Stop the sound when the reels stop spinning
                    spinSound.pause();
                    spinSound.currentTime = 0; // Rewind to the beginning

                    // Check for a win
                    checkWin(finalSymbol1, finalSymbol2, finalSymbol3, betAmount);
                }, 200); // Delay before stopping the final spin
            }
        }, 200); // Change symbols every 200ms
    }

    // Function to check if the player has won
    function checkWin(symbol1, symbol2, symbol3, betAmount) {
        let isWin = false;
        let winningAmount = 0; // Variable to store the winning amount

        // Winning conditions
        if (symbol1 === symbol2 && symbol2 === symbol3) {
            // Win with 3 of a kind
            winningAmount = betAmount * 10; // High reward for three matches
            balance += winningAmount; // Add winning amount to balance
            winSound.currentTime = 0; // Rewind sound to start
            winSound.play(); // Play the win sound
            isWin = true;
            wins++; // Increment win count
        } else if (symbol1 === symbol2 || symbol1 === symbol3 || symbol2 === symbol3) {
            // Win with 2 of a kind
            winningAmount = betAmount * 2; // Small reward for two matches
            balance += winningAmount; // Add winning amount to balance
            winSound.currentTime = 0; // Rewind sound to start
            winSound.play(); // Play the win sound
            isWin = true;
            wins++; // Increment win count
        } else if ([symbol1, symbol2, symbol3].includes('🎰')) {
            // Special case for the 🎰 symbol
            showCardSelection(); // Show card selection if 🎰 is present
            resultDisplay.textContent = "Select a card"; // Change message to "Select a card"
            spinButton.style.display = 'inline-block'; // Show the spin button again
            return;
        } else {
            resultDisplay.textContent = "Try Again!";
            spinButton.style.display = 'inline-block'; // Show the spin button again
        }

        // Update balance display
        balanceDisplay.textContent = `Balance: £${balance}`;

        // Display the winning amount if there's a win
        if (isWin) {
            resultDisplay.textContent = `🎉 You Win! £${winningAmount} 🎉`;
        }

        // Record the spin result in local storage
        recordSpinHistory([symbol1, symbol2, symbol3]);
        spinButton.style.display = 'inline-block'; // Show the spin button again
    }

    // Function to record spin results in local storage
    function recordSpinHistory(spinResult) {
        let history = JSON.parse(localStorage.getItem('spinHistory')) || []; // Get existing history
        history.unshift(spinResult); // Add new spin result to history
        if (history.length > 10) { // Keep the last 10 spins
            history.pop(); // Remove the oldest
        }
        localStorage.setItem('spinHistory', JSON.stringify(history)); // Save to local storage
    }

    // Attach spin function to button
    spinButton.addEventListener('click', spinSlots);
});
