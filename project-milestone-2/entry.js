document.addEventListener("DOMContentLoaded", function () {
    let selectedMood = "";
    const lastMoodEl = document.getElementById("lastMood");
    const lastJournalEl = document.getElementById("lastJournal");
    const journalInput = document.getElementById("journalEntry");
    const saveBtn = document.getElementById("saveEntryBtn");

    const messageContainer = document.createElement("div");
    messageContainer.setAttribute("aria-live", "polite");
    saveBtn.insertAdjacentElement("afterend", messageContainer);

    const allEntries = JSON.parse(localStorage.getItem("allMoodEntries")) || [];
    if (allEntries.length > 0) {
        const lastEntry = allEntries[allEntries.length - 1];
        lastMoodEl.textContent = lastEntry.mood;
        lastJournalEl.textContent = lastEntry.journal;
    }

    document.querySelectorAll(".mood-btn").forEach(button => {
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", () => {
            selectedMood = button.getAttribute("data-mood");

            document.querySelectorAll(".mood-btn").forEach(btn => {
                btn.classList.remove("active");
                btn.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
        });
    });

    saveBtn.addEventListener("click", () => {
        const journalText = journalInput.value.trim();

        if (!selectedMood || !journalText) {
            showMessage("Please select a mood and write a journal entry.", "error");
            return;
        }

        const newEntry = {
            mood: selectedMood,
            journal: journalText,
            date: new Date().toISOString()
        };

        allEntries.push(newEntry);
        localStorage.setItem("allMoodEntries", JSON.stringify(allEntries));
        localStorage.setItem("lastMood", selectedMood);
        localStorage.setItem("lastJournal", journalText);

        lastMoodEl.textContent = selectedMood;
        lastJournalEl.textContent = journalText;

        journalInput.value = "";
        selectedMood = "";

        document.querySelectorAll(".mood-btn").forEach(btn => {
            btn.classList.remove("active");
            btn.setAttribute("aria-pressed", "false");
        });

        showMessage("✅ Your mood entry has been saved!", "success");
    });

    function showMessage(text, type) {
        messageContainer.textContent = text;
        messageContainer.className = type === "error" ? "text-danger mt-2" : "text-success mt-2";
        setTimeout(() => {
            messageContainer.textContent = "";
        }, 3000);
    }
});


