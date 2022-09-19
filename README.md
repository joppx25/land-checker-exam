
# Land Checker Exam

![code gif](https://github.com/joppx25/land-checker-exam/code.gif)

### Note
 You can toggle the `BROWSER_NO_HEADLESS` variable inside env file to show the browser for realtime scraping or make it headless to run the scraper in headless mode(will not launch a chromium instance).


### Setup
- clone repo (`git clone git@github.com:joppx25/land-checker-exam.git`)
- `cd land-checker-exam`
- `cp .env.default .env`
- `sudo chmod +x crawler`
- `npm install`

### To run the scraper

```bash
./crawler # This will show available commands you can execute
```

`Add -b(verbose) arg to show logger information`
```bash
./crawler eproperty:get-data -b
```

