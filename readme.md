# POC testing for AI document reader

## Start server

1. add .env file and add you API key there

2. npm install

3. source .env

4. run `npm run dev`

## Ask a question

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
