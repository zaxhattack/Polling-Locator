# CSCE 315 - Polling Locator
Polling Locator provides a simple way of locating polling locations for upcoming government elections.

### Locally Testing
[Download and install Node.js](https://nodejs.org/en/). We're using the current version of the LTS (12.13.0).

Next, clone the repository

	git clone https://github.tamu.edu/scott-wilkins/csce315-p2.git

Navigate to the directory and install express.

    npm install expres --save

Next, install dotenv.

	npm install dotenv

Within the root directory, create a file named *.env* with the following content

    CIVIC_KEY=<paste google civic api key>