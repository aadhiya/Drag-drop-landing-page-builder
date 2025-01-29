# Landing Page Builder

🚀 A simple, drag-and-drop landing page builder built with Vue 3.
It features editable text and image blocks, resizing, reordering, duplication, and deletion with JSON export functionality.

## 📌 Features

- 🔲 **Two Draggable Blocks:**
  - **Text Block:** Editable text content.
  - **Image Block:** Select from 3 predefined images.
- 🖱️ **Drag & Drop:** Rearrange elements with ease.
- 📏 **Resizable Blocks:** Adjust block size dynamically.
- ➕ **Duplicate & ❌ Delete:** Easily duplicate or remove blocks.
- 💾 **JSON Export:** Saves page structure and content to JSON.
- 📱 **Responsive Design:** Works across different screen sizes.
- 🧪 **Cypress Test Cases:** Automated tests ensure stability.

## 📖 Table of Contents

- 📦 [Setup](#setup)
- 🚀 [Quickstart](#quickstart)
- 🛠 [Development](#development)
- 🕵🏻‍♂️ [Tests](#tests)
- ⚡ [JSON Export](#json-export)
- 🎨 [Styling](#styling)
- 📌 [Features Recap](#features-recap)
- 📜 [Credits & License](#credits--license)

---

## 📦 Setup

To install dependencies, run:

```sh
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

## 🚀 Quickstart

Run the project locally with:

```sh
npm run dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Development

This project is built using Vue 3, Vite, and Tailwind CSS.

### Registering Draggable Blocks

The app uses Vue's directive-based approach for drag-and-drop functionality.

Example usage:

```vue
<!-- Draggable Text Block -->
<div v-draggable class="draggable-box">
  <textarea v-model="editableText"></textarea>
</div>
```

---

## 🕵🏻‍♂️ Tests

This project uses Cypress for testing.

### Running Tests

```sh
npm run cypress:open  # Opens Cypress test runner
npm run test          # Runs all tests in headless mode
```

Test cases ensure that:

- Blocks are draggable.
- Text content is editable.
- Image selection updates correctly.
- Blocks can be duplicated & deleted.
- JSON export logs the correct data.

---

## ⚡ JSON Export

When clicking the Save button, all block data is exported as JSON and logged in the console.

Example:

```json
[
  {
    "id": 1,
    "type": "text",
    "content": "Editable text",
    "width": 350,
    "height": 250
  },
  {
    "id": 2,
    "type": "image",
    "selectedImage": "image2.jpg",
    "width": 350,
    "height": 380
  }
]
```

---

## 🎨 Styling

This project uses CSS & Tailwind CSS for styling.

### Main UI improvements:

- Modern UI with gradient backgrounds.
- Sticky navigation bar with action buttons.
- Smooth animations for hover effects & transitions.


---

## 📌 Features Recap

✅ **Drag & Drop Builder**  
✅ **Editable Text & Images**  
✅ **Resizable Blocks**  
✅ **Duplicate & Delete Blocks**  
✅ **JSON Export Functionality**  
✅ **Responsive Design**  
✅ **Cypress Test Cases**  

---

## 📜 Credits & License

This project is based on the original work of **@bcakmakoglu**. Some parts of the code were adapted from their Revue Draggable repository.

### **Modifications & Enhancements**

- Integrated a **Landing Page Builder** with draggable blocks.
- Added **editable text** and **image selection** functionality.
- Implemented **resizing, duplication, deletion, and JSON export**.
- Enhanced **styling and responsiveness**.

The project is released under the **MIT License**, as per the original repository. See the [LICENSE](LICENSE) file for details.
