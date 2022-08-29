
# Land Checker Exam

### Note
 You can toggle the `BROWSER_NO_HEADLESS` variable inside env file to show the browser for realtime scraping or make it headless to run the scraper in headless mode(will not launch a chromium instance).
 By default this variable is set to false in which it is expected to launch a chromium browser in every execute of command.


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
