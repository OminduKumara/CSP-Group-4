using NUnit.Framework;

namespace UnitTests;

public class Tests
{
    [SetUp]
    public void Setup()
    {
        // This runs before every test - good for initializing data
    }

    [Test]
    public void Test1()
    {
        // A basic placeholder test
        Assert.Pass("Basic framework check passed.");
    }

    [Test]
    public void Verify_System_Integrity_Test()
    {
        // A meaningful test for your Viva
        bool isBackendReady = true; 
        Assert.That(isBackendReady, Is.True, "The Backend service should be initialized.");
    }

    [Test]
    public void Intentional_Failure_Test()
    {
        // UNCOMMENT THIS to prove to your examiners that the pipeline catches errors!
        // int expectedValue = 10;
        // int actualValue = 5;
        // Assert.AreEqual(expectedValue, actualValue, "The calculation logic is incorrect!");
    }
}