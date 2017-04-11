#/bin/sh

echo "Check python exist..."
python --version
if [ $? -ne 0 ] 
then
    echo "Please install Python 2.7!!!"
    exit 1
fi

echo "Check pip exist.."
pip --version
if [ $? -ne 0 ] 
then
    echo "Please install pip!!"
    exit 1
fi

pip install robotframework &&
pip install robotframework-selenium2library &&
pip install xlrd  &&
echo "Download Chrome driver..."
curl http://chromedriver.storage.googleapis.com/2.25/chromedriver_win32.zip > chromedriver.zip &&
echo "Extracting Chrome driver..."
unzip chromedriver.zip -d /c/Python27/Scripts &&
echo "Done!"