# POC testing for AI document reader

## Start server

1. `cp .env.sample .env` and add you OpenAI API key to .env file

2. npm install

3. source .env

4. run `npm run dev`

## Ask a question

### API 1

Uses a PDF file found in docs folder as a source

Send POST request to `http://localhost:3000/question`

Example:

```
{
"question": "Who is the CV about?"
}
```

Should return:

```
{
"text": " The CV is about Rachel Green."
}
```

### API 2

Uses following site as a source [here](https://lilianweng.github.io/posts/2023-06-23-agent/)

Send POST request to `http://localhost:3000/v2/question`

Example:

```
{
"question": "What is task decomposition?"
}
```

Should return:

```
{
"text": " Task decomposition is the process of breaking down a complex task into smaller, more manageable subgoals or steps. This allows for efficient handling of complex tasks by dividing them into smaller and more achievable components. Task decomposition can be done through various methods such as using simple prompts, task-specific instructions, or human inputs."
}
```

## Client

Start the server and run `npm run client` for simple user interface where you can ask a question also

# Resources used

https://js.langchain.com/docs/use_cases/question_answering/
