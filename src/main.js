const FORM = document.querySelector('#question-form');
const ANSWER = document.querySelector('#answer');
const API_URL = 'http://localhost:3000/question';
const LOADER = document.querySelector('#loader');
const ERROR = document.querySelector('#error');

FORM.onsubmit = async (e) => {
  e.preventDefault();
  LOADER.style.display = 'block';
  const question = FORM.elements.question.value;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });
    const answer = await response.json();
    ANSWER.innerHTML += `<p>${answer.text}</p>`;
    LOADER.style.display = 'none';
  } catch (error) {
    LOADER.style.display = 'none';
    ERROR.style.display = 'block';
    ANSWER.innerHTML = 'error!!';
  }
};
