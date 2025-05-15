let stories = [];
let currentChatUser = "";
let chatHistory = {}; 

const storiesPerPage = 3;
let currentStoryIndex = 0; // tracks how many stories shown

function randomColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  return "just now";
}

function postStory() {
  const input = document.getElementById("storyInput");
  const text = input.value.trim();
  if (text === "") return;

  const story = {
    text,
    likes: 0,
    comments: [],
    author: "User" + Math.floor(Math.random() * 1000),
    date: new Date()
  };
  stories.unshift(story);
  input.value = "";

  // Reset pagination on new post
  currentStoryIndex = 0;
  renderStories(true);
}

function renderStories(reset = false) {
  const feed = document.getElementById("storyFeed");
  if (reset) {
    feed.innerHTML = "";
  }

  // Load next batch of stories
  const nextStories = stories.slice(currentStoryIndex, currentStoryIndex + storiesPerPage);
  nextStories.forEach((story, index) => {
    const div = document.createElement("div");
    div.className = "story";

    const avatarLetter = story.author.charAt(0);
    const avatarColor = randomColor(story.author);

    div.innerHTML = `
      <div class="author-info">
        <div class="avatar" style="background-color:${avatarColor}">${avatarLetter}</div>
        <div class="author-name">${story.author}</div>
        <div class="timestamp">${timeSince(story.date)}</div>
      </div>
      <div class="story-text">${escapeHTML(story.text)}</div>
      <div class="actions">
        <button aria-label="Like story" onclick="likeStory(${currentStoryIndex + index})">❤️ ${story.likes}</button>
        <button aria-label="Open chat" onclick="openChat('${story.author}')">💬 Chat</button>
        <input placeholder="Add comment..." aria-label="Add comment" onkeypress="if(event.key==='Enter') addComment(${currentStoryIndex + index}, this)">
      </div>
      <div class="comment-box">
        ${story.comments.map(c => `<div class="comment">${escapeHTML(c)}</div>`).join("")}
      </div>
    `;
    feed.appendChild(div);
  });

  currentStoryIndex += storiesPerPage;
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, function (match) {
    return ({
      '&': "&amp;",
      '<': "&lt;",
      '>': "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[match];
  });
}

function likeStory(index) {
  stories[index].likes++;
  // Instead of full re-render, update like count only for clicked story
  const feed = document.getElementById("storyFeed");
  const storyDiv = feed.children[index];
  if (storyDiv) {
    const likeBtn = storyDiv.querySelector("button");
    likeBtn.textContent = `❤️ ${stories[index].likes}`;
  }
}

function addComment(index, input) {
  const comment = input.value.trim();
  if (comment === "") return;
  stories[index].comments.push(comment);
  input.value = "";
  // Refresh comment box for that story only
  const feed = document.getElementById("storyFeed");
  const storyDiv = feed.children[index];
  if (storyDiv) {
    const commentBox = storyDiv.querySelector(".comment-box");
    commentBox.innerHTML = stories[index].comments.map(c => `<div class="comment">${escapeHTML(c)}</div>`).join("");
  }
}

function openChat(user) {
  currentChatUser = user;
  document.getElementById("chatUser").textContent = user;

  if (!chatHistory[user]) chatHistory[user] = [];

  renderChatMessages();
  document.getElementById("chatModal").style.display = "flex";
  document.getElementById("chatInput").focus();
}

function closeChat() {
  document.getElementById("chatModal").style.display = "none";
}

function renderChatMessages() {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";
  chatHistory[currentChatUser].forEach(msg => {
    const div = document.createElement("div");
    div.className = "chat-message " + (msg.sender === "me" ? "you" : "them");
    div.textContent = msg.text;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  chatHistory[currentChatUser].push({ sender: "me", text });
  renderChatMessages();
  input.value = "";

  setTimeout(() => {
    const replies = [
      "That's interesting!",
      "Tell me more.",
      "I totally agree!",
      "Wow, I never thought of that.",
      "Haha, that's funny!",
      "Thanks for sharing!"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    chatHistory[currentChatUser].push({ sender: "them", text: reply });
    renderChatMessages();
  }, 1200);
}

// Infinite scroll detection:
window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
    // Near bottom of page, load more stories if available
    if (currentStoryIndex < stories.length) {
      renderStories();
    }
  }
});

// Initial load: for demo, add dummy stories so scrolling makes sense
function addDummyStories(count = 12) {
  const sampleTexts = [
    "I love this book series! The characters feel so real.",
    "My favorite place to relax is the beach during sunset.",
    "Just listened to an amazing album by my favorite artist.",
    "I had a great experience hiking last weekend in the mountains.",
    "Trying out new recipes is my hobby, and it’s so rewarding!",
    "Watching old movies is a comforting way to spend an evening.",
    "I enjoy painting and expressing my feelings through colors.",
    "Reading historical novels transports me to different eras.",
    "Music festivals are my happy place with great vibes.",
    "Learning new languages opens so many doors for me.",
    "My dog always cheers me up after a long day.",
    "Traveling helps me understand the world better."
  ];
  for (let i = 0; i < count; i++) {
    stories.push({
      text: sampleTexts[i % sampleTexts.length],
      likes: Math.floor(Math.random() * 20),
      comments: [],
      author: "User" + (100 + i),
      date: new Date(Date.now() - Math.random() * 1e10)
    });
  }
}

// Initialize
addDummyStories();
renderStories(true);
