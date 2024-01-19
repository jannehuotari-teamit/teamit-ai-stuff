const FORM = document.querySelector('#question-form');
const ANSWER = document.querySelector('#answer');
const API_URL = 'http://localhost:3000/question';
const LOADER = document.querySelector('#loader');
const ERROR = document.querySelector('#error');
let num = 0;
FORM.onsubmit = async (e) => {
  num++;
  e.preventDefault();
  const question = FORM.elements.question.value;
  ANSWER.innerHTML += `<p>${question}</p>`;
  ANSWER.innerHTML += `<img class="bot-answer-loader" src="loader.webp" alt="AI" />`;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });
    const answer = await response.json();
    document.querySelector('.bot-answer-loader').remove();

    ANSWER.innerHTML += `
        <p class="bot-answer">
        ${answer.text}
        </p>
      `;
  } catch (error) {
    document.querySelector('.bot-answer-loader').remove();
    ANSWER.innerHTML += `<img class="bot-error-loader" src="error.gif" alt="AI" />`;
    setTimeout(() => {
      document.querySelector('.bot-error-loader').remove();
      ANSWER.innerHTML += `
        <p class="bot-answer">
        Sorry, i have encountered an error, please try again later.
        </p>
      `;
    }, 4500);
  }
};
