function loadBooks() {
  return JSON.parse(localStorage.getItem('books') || '[]');
}

function saveBooks(data) {
  localStorage.setItem('books', JSON.stringify(data));
}

// Search Author
window.searchAuthor = async function () {
  const author = document.getElementById('authorInput').value.trim();
  const results = document.getElementById('bookResults');
  if (!author) return alert("Please enter author name!");
  results.innerHTML = "<p>Loading...</p>";

  try {
    const authorRes = await fetch(`https://openlibrary.org/search/authors.json?q=${author}`);
    const authorData = await authorRes.json();

    if (authorData.docs.length === 0) {
      results.innerHTML = "<p>No author found.</p>";
      return;
    }

    const authorKey = authorData.docs[0].key;
    const worksRes = await fetch(`https://openlibrary.org/authors/${authorKey}/works.json`);
    const worksData = await worksRes.json();

    results.innerHTML = "";
    (worksData.entries || []).slice(0, 8).forEach(book => {
      const div = document.createElement('div');
      div.classList.add('book');
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${author}</p>
        <p>First Published: ${book.first_publish_date || 'Unknown'}</p>
        <p>Subjects: ${(book.subject || book.subjects || []).slice(0, 3).join(', ') || 'Not available'}</p>
        <button onclick="addBook('${book.title.replace(/'/g, "\\'")}')">Add to List</button>
      `;
      results.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    results.innerHTML = "<p>Error loading data. Please try again.</p>";
  }
};

// CRUD

// CREATE
window.addBook = function (title) {
  const books = loadBooks();
  if (books.find(b => b.title === title)) return alert("Already in list!");
  books.push({ title, read: false, summary: "" });
  saveBooks(books);
  alert("Book added!");
};

// READ
window.displayList = function () {
  const listDiv = document.getElementById('readingList');
  if (!listDiv) return;
  const books = loadBooks();
  listDiv.innerHTML = '';

  if (books.length === 0) {
    listDiv.innerHTML = "<p>Your reading list is empty.</p>";
    return;
  }

  books.forEach((book, i) => {
    const div = document.createElement('div');
    div.classList.add('book-item');
    div.innerHTML = `
      <h3>${book.title}</h3>
      <p>Status: ${book.read ? "✅Read" : "❌Not Read"}</p>
      <button onclick="markRead(${i})">Mark as Read</button>
      <button onclick="deleteBook(${i})">Delete</button>
    `;
    listDiv.appendChild(div);
  });
};

// UPDATE
window.markRead = function (index) {
  const books = loadBooks();
  books[index].read = true;
  saveBooks(books);
  displayList();
};

// DELETE
window.deleteBook = function (index) {
  const books = loadBooks();
  if (!confirm("Are you sure you want to delete this book?")) return;
  books.splice(index, 1);
  saveBooks(books);
  displayList();
};

window.onload = displayList;