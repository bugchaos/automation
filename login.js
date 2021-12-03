// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality

const puppeteer = require('puppeteer-extra')
const otplib = require('otplib')
const accounts = require("./accounts")
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const {createCursor} = require("ghost-cursor");
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const {default: axios} = require('axios');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function login(start_url, otp_code_test, username, password, country_code) {
    axios.get(start_url).then(async function (response) {
        if (response.status == 200) {
            console.log(username)
            await sleep(10000)
            response.data.value = response.data.value.replace('127.0.0.1', '192.168.0.115')
            axios.get(response.data.value + "/json/version").then(function (response) {
                debug_url = response.data.webSocketDebuggerUrl
                debug_url = debug_url.replace('127.0.0.1', '192.168.0.115')
                puppeteer.use(StealthPlugin())
                puppeteer.use(
                    RecaptchaPlugin({
                        provider: {
                            id: '2captcha',
                            token: '20cb47a7f76373d66864dc1b3bf5caee' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
                        },
                        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
                    })
                )
                puppeteer.connect({
                    browserWSEndpoint: debug_url,
                    headless: false,
                    userDataDir: '/Users/bytedance/Github/coinlist/profiles',
                }).then(async browser => {
                    console.log(username)
                    const page = await browser.newPage()
                    await page.setDefaultTimeout(800000)
                    await page.setDefaultNavigationTimeout(800000)
                    await page.setViewport({width: 1365, height: 969})
                    const cursor = createCursor(page)
                    await page.goto('https://coinlist.co/umee-option-1')
                    await page.solveRecaptchas()
                    try {
                        await page.waitForTimeout(5000)
                        await page.waitForSelector('#challenge-form')
                        await page.waitForSelector('#cf-hcaptcha-container')
                        await page.waitForSelector('#cf-hcaptcha-container > iframe')
                        const hcapcha = await page.$('#cf-hcaptcha-container > iframe')
                        const frame = await hcapcha.contentFrame()
                        await frame.waitForSelector("#checkbox")
                        const checkbox = await frame.$('#checkbox')
                        await checkbox.click()
                        await page.solveRecaptchas()
                    } catch (error) {
                        console.log(error)
                        console.log('no capcha')
                    }

                    await page.solveRecaptchas()
                    try {
                        await page.waitForSelector('#user_password')
                    } catch (error) {
                        console.log(error)
                        console.log('no user password')
                    }
                    const active = await page.$('#user_password')
                    if (active != null) {
                        await page.waitForSelector('#user_password')
                        await page.click('#user_email')
                        await page.click('#user_email', {clickCount: 3})
                        await page.keyboard.press('Backspace')
                        // let input_value = await page.$eval('#user_email',el => el.value)
                        // for (let i=0;i<input_value.length;i++){
                        //     await page.keyboard.press('Backspace')
                        // }
                        await page.keyboard.type(username, {delay: 5})
                        await page.click('#user_password')
                        await page.click('#user_password', {clickCount: 3})
                        await page.keyboard.press('Backspace')
                        await page.keyboard.type(password, {delay: 5})
                        await page.waitForSelector('#new_user > div > div:nth-child(5) > input')
                        await cursor.click('#new_user > div > div:nth-child(5) > input')
                        await page.waitForTimeout(5000)
                        // await page.waitForNetworkIdle()
                        await page.solveRecaptchas()
                        // await cursor.click('#new_user > input')
                        // await page.waitForNavigation({timeout:50000})
                        const token = otplib.authenticator.generate(otp_code_test);
                        await page.waitForSelector("#multi_factor_authentication_totp_otp_attempt")
                        await cursor.click("#multi_factor_authentication_totp_otp_attempt")
                        await page.keyboard.type(token, {delay: 5})
                        await cursor.click('#new_multi_factor_authentication_totp > div > div:nth-child(2) > input')

                    }
                    const navigationPromise = page.waitForNavigation()
                    await page.goto('https://coinlist.co/umee')
                    await page.solveRecaptchas()
                    register = false
                    if (!register) {
                        return
                    }
                    for (let i = 1; i <= 2; i++) {
                        await page.waitForSelector('#cover_top_content > .index-deal_page_index-header > .content > .u-text-center > .c-button')
                        await cursor.click('#cover_top_content > .index-deal_page_index-header > .content > .u-text-center > .c-button')

                        await navigationPromise

                        await page.waitForSelector(`.s-grid > .s-grid-colLg8:nth-child(${i}) > .register-options > .u-text-center > .c-button`)
                        await cursor.click(`.s-grid > .s-grid-colLg8:nth-child(${i}) > .register-options > .u-text-center > .c-button`)

                        await navigationPromise

                        await page.waitForSelector('.s-grid > .s-grid-colSm16 > .layouts-shared-offering_flow__content > .offerings-entities-onboarding > .c-button')
                        await cursor.click('.s-grid > .s-grid-colSm16 > .layouts-shared-offering_flow__content > .offerings-entities-onboarding > .c-button')

                        await navigationPromise

                        await page.waitForSelector('.s-grid-colSm16 > .layouts-shared-offering_flow__content > .offerings-entities-new > .js-existing_entity > .c-button')
                        await cursor.click('.s-grid-colSm16 > .layouts-shared-offering_flow__content > .offerings-entities-new > .js-existing_entity > .c-button')

                        await navigationPromise

                        await page.waitForSelector('#forms_offerings_participants_residence_residence_country')
                        await cursor.click('#forms_offerings_participants_residence_residence_country')

                        await page.select('#forms_offerings_participants_residence_residence_country', country_code)

                        await page.waitForSelector('#forms_offerings_participants_residence_residence_country')
                        await cursor.click('#forms_offerings_participants_residence_residence_country')

                        await page.waitForSelector('.offerings-participants-residence-form > #new_forms_offerings_participants_residence > .s-marginBottom2 > .c-input-group > .c-label')
                        await cursor.click('.offerings-participants-residence-form > #new_forms_offerings_participants_residence > .s-marginBottom2 > .c-input-group > .c-label')

                        await page.waitForSelector('.offerings-participants-residence > .offerings-participants-residence-form > #new_forms_offerings_participants_residence > .s-marginTop2 > .js-submit')
                        await cursor.click('.offerings-participants-residence > .offerings-participants-residence-form > #new_forms_offerings_participants_residence > .s-marginTop2 > .js-submit')

                        await navigationPromise

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(1) > .c-input-group > .c-label:nth-child(4)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(1) > .c-input-group > .c-label:nth-child(4)')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(2) > .c-input-group > .c-label:nth-child(3)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(2) > .c-input-group > .c-label:nth-child(3)')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(3) > .c-input-group > .c-label:nth-child(3)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(3) > .c-input-group > .c-label:nth-child(3)')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(4) > .c-input-group > .c-label:nth-child(2)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(4) > .c-input-group > .c-label:nth-child(2)')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(5) > .c-input-group > .c-label:nth-child(2)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(5) > .c-input-group > .c-label:nth-child(2)')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(6) > .c-input-group > .c-label:nth-child(3)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(6) > .c-input-group > .c-label:nth-child(3)')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(7) > .c-input-group > .c-label:nth-child(4)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(7) > .c-input-group > .c-label:nth-child(4)')

                        await page.waitForSelector('.offerings-participants-quiz-form > .simple_form > .c-input-group > .s-marginBottom1:nth-child(8) > .c-input-group')
                        await page.click('.offerings-participants-quiz-form > .simple_form > .c-input-group > .s-marginBottom1:nth-child(8) > .c-input-group')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(8) > .c-input-group > .c-label:nth-child(4)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(8) > .c-input-group > .c-label:nth-child(4)')

                        await page.waitForSelector('.simple_form > .c-input-group > .s-marginBottom1:nth-child(9) > .c-input-group > .c-label:nth-child(2)')
                        await page.click('.simple_form > .c-input-group > .s-marginBottom1:nth-child(9) > .c-input-group > .c-label:nth-child(2)')

                        await page.waitForSelector('.offerings-participants-quiz > .offerings-participants-quiz-form > .simple_form > .s-marginTop2 > .js-submit')
                        await page.click('.offerings-participants-quiz > .offerings-participants-quiz-form > .simple_form > .s-marginTop2 > .js-submit')

                        await navigationPromise
                    }


                    await browser.close()

                })
            })
        }
    })
}

accounts.hk_accounts.forEach(data => {
    try {
        let start_url = `http://192.168.0.115:35000/api/v1/profile/start?skiplock=true&profileId=${data.profile_id}`
        let code = data.op_code
        let username = data.username
        let password = data.password
        let country = data.country_code
        console.log(data)
        login(start_url, code, username, password, country)
    } catch (e) {
        console.log(e)
    }
})


