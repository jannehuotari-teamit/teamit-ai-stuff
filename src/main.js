const FORM = document.querySelector('#question-form');
const ANSWER = document.querySelector('#answer');
const API_URL = 'http://localhost:3000/question';
const LOADER = document.querySelector('#loader');

FORM.onsubmit = async (e) => {
  e.preventDefault();
  LOADER.style.display = 'block';
  const question = FORM.elements.question.value;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question })
  });
  const answer = await response.json();
  ANSWER.innerHTML = answer.text;
  LOADER.style.display = 'none';
};
