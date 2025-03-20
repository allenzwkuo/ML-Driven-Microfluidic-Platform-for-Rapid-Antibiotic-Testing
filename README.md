Make sure Python is installed, to install Python run this in terminal (installs brew then python 3.11):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install python@3.11
```
Install npm:

```bash
brew install node
```

Install pip:

```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

python3 get-pip.py
```

Create a venv (make sure in app directory):
```bash
python3.11 -m venv venv
```

Activate venv
```bash
source venv/bin/activate
```

Install dependencies
```bash
pip install -r requirements.txt

npm install

npm run build
```

Run the app
```bash
npm start
```
