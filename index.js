const puppeteer = require("puppeteer");

const id = "";
const password = "";

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // 페이지 이동
  await page.goto("https://dhlottery.co.kr");

  // 뷰포트 사이즈 조절
  await page.setViewport({ width: 1080, height: 1024 });

  // 로그인 페지 이동
  await page
    .locator(
      "body > div:nth-child(1) > header > div.header_con > div.top_menu > form > div > ul > li.log > a"
    )
    .click();

  // 아이디 입력
  await page.locator("#userId").fill(id);

  // 비밀번호 입력
  await page
    .locator(
      "#article > div:nth-child(2) > div > form > div > div.inner > fieldset > div.form > input[type=password]:nth-child(2)"
    )
    .fill(password);

  // 로그인 버튼 클릭
  await page
    .locator(
      "#article > div:nth-child(2) > div > form > div > div.inner > fieldset > div.form > a"
    )
    .click();

  await page.waitForNavigation();

  // await page.locator(
  //     "body > div:nth-child(1) > header > div.header_con > div.top_menu > form > div > ul.information > li.money > a:nth-child(2) > strong"
  //   )

  // 요소가 존재하는지 확인
  const wonSelector =
    "body > div:nth-child(1) > header > div.header_con > div.top_menu > form > div > ul.information > li.money > a:nth-child(2) > strong";
  await page.waitForSelector(wonSelector);

  const won = await page.$(wonSelector);

  const wonText = await (await won.getProperty("textContent")).jsonValue();

  // 예치금이 없다면 충전
  if (wonText === "0원") {
    await page
      .locator(
        "body > div:nth-child(1) > header > div.header_con > div.top_menu > form > div > ul.information > li.money > a:nth-child(3)"
      )
      .click();

    await page.waitForNavigation();

    await page.select("#EcAmt", "10000");

    const [popup] = await Promise.all([
      new Promise((resolve) => browser.once("targetcreated", resolve)),
      await page.locator("#btn2 > button").click(),
    ]);

    // 팝업 페이지를 기다리기
    const popupPage = await popup.page();

    // 팝업이 닫힐 때까지 대기
    await new Promise((resolve) => popupPage.once("close", resolve));
  }

  // 복권구매 리스트 포커스
  await page.locator("#gnb > ul > li.gnb1").hover();

  const [popup] = await Promise.all([
    new Promise((resolve) => browser.once("targetcreated", resolve)),
    // 복권구매 클릭
    await page
      .locator("#gnb > ul > li.gnb1.active > div > ul > li.gnb1_1 > a")
      .click(),
  ]);

  // 팝업 페이지를 기다리기
  const popupPage = await popup.page();

  // 복권구매
  await popupPage.waitForFrame(async (frame) => {
    await frame.locator("#num2").click();

    await frame.select("#amoundApply", "5");

    await frame.locator("#btnSelectNum").click();

    await frame.locator("#popupLayerAlert > div > div.btns > input").click();

    await frame.locator("#btnBuy").click();
  });
};

main();
