using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using NUnit.Framework;

namespace UITests;

public class LoginTests
{
    private IWebDriver driver;

    [SetUp]
    public void Setup()
    {
        // Initialize Chrome in Headless mode (required for GitHub Actions)
        var options = new ChromeOptions();
        options.AddArgument("--headless"); 
        driver = new ChromeDriver(options);
    }

    [Test]
    public void Verify_LoginPage_Loads()
    {
        // Replace with your actual local or hosted frontend URL
        string url = "https://www.google.com"; 
        
        driver.Navigate().GoToUrl(url);

        // Check if the title contains your project name
        Assert.That(driver.Title, Does.Contain("Google"), "The Login page did not load correctly.");
    }

    [TearDown]
    public void CloseBrowser()
    {
        driver.Quit();
        driver.Dispose();
    }
}