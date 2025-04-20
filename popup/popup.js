(function () {
  'use strict';

  const toggleButton = document.getElementById('toggle-feature');
  const footerButtons = document.querySelectorAll('.footer button');
  const header = document.getElementById('site-header');

  // Update toggle button appearance
  function updateButtonAppearance(isActive) {
    const svg = toggleButton.querySelector('svg');
    svg.style.fill = isActive ? 'var(--primary-hover)' : 'var(--primary-color)';
  }

  // Handle toggle button click
  toggleButton.addEventListener('click', () => {
    chrome.storage.sync.get('toggleState', ({ toggleState }) => {
      const newState = !toggleState;
      chrome.storage.sync.set({ toggleState: newState }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving toggle state:', chrome.runtime.lastError);
        }
        updateButtonAppearance(newState);
      });
    });
  });

  // Open external links in new tab
  footerButtons.forEach(button => {
    button.addEventListener('click', () => {
      const iconClass = button.querySelector('i').className;
      let url = null;

      if (iconClass.includes('fa-github')) {
        url = 'https://github.com/DuckCIT';
      } else if (iconClass.includes('fa-code')) {
        url = 'https://github.com/DuckCIT/FBIG-Stories-Unseen';
      } else if (iconClass.includes('fa-facebook')) {
        url = 'https://facebook.com/tducxD';
      }

      if (url) chrome.tabs.create({ url });
    });
  });

  // Load toggle state (default to true if not set)
  chrome.storage.sync.get('toggleState', (data) => {
    if (data.toggleState === undefined) {
      chrome.storage.sync.set({ toggleState: true }, () => {
        updateButtonAppearance(true);
      });
    } else {
      updateButtonAppearance(data.toggleState);
    }
  });

  // Display current tab hostname
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    let hostname;

    try {
      hostname = new URL(url).hostname;
    } catch {
      hostname = 'unknown';
    }

    header.textContent = hostname;

    // Highlight header in red if not Facebook or Instagram
    if (!hostname.includes('facebook.com') && !hostname.includes('instagram.com')) {
      header.classList.add('error');
    }
  });

  const updateButton = document.getElementById('update-button');
  const currentVersion = chrome.runtime.getManifest().version;
  const versionURL = 'https://raw.githubusercontent.com/DuckCIT/FBIG-Stories-Unseen/main/version.json';

  fetch(versionURL)
    .then(response => response.json())
    .then(data => {
      const latestVersion = data.version;
      const changelogURL = data.changelog;

      if (currentVersion !== latestVersion) {
        updateButton.title = `New version ${latestVersion} available! Click to see details.`;
        updateButton.style.color = 'var(--primary-hover)';
        updateButton.style.animation = 'pulse 1.2s infinite';

        updateButton.addEventListener('click', () => {
          chrome.tabs.create({ url: changelogURL });
        });
      } else {
        updateButton.title = `You're up to date! (v${currentVersion})`;
      }
    })
    .catch(error => {
      console.error('Failed to fetch version info:', error);
      updateButton.title = `Update check failed`;
    });

})();
