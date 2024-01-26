const FORM = document.querySelector('#question-form');
const ANSWER = document.querySelector('#answer');
const FORM_2 = document.querySelector('#question-form_2');
const ANSWER_2 = document.querySelector('#answer_2');
const API_URL = 'http://localhost:3000/question';
const API_URL_2 = 'http://localhost:3000/v2/question';
const LOADER = document.querySelector('#loader');
const ERROR = document.querySelector('#error');

FORM.onsubmit = async (e) => {
  e.preventDefault();
  const question = FORM.elements.question.value;
  ANSWER.innerHTML += `<p class="user-question">${question}</p>`;
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
        <p class="bot-answer error">
        Sorry, i have encountered an error, please try again later.
        </p>
      `;
    }, 4500);
  }
};
