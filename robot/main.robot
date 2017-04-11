*** Settings ***
Library             OperatingSystem
Library             String
Suite Setup         Open Browser    ${landingURL}   chrome
Suite Teardown      Close Browser
Resource            helpers/seleniumLibrary.robot

*** Test Cases ***
Test Case
    Set Selenium Implicit Wait  50s
    waitForElementPresent    id=login
    ${filename} =   Generate Random String
    ${content} =    Execute Javascript      return JSON.stringify(__coverage__);
    Create File     ${EXECDIR}/coverage/json/${filename}.json   ${content}