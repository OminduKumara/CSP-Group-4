using NUnit.Framework;

namespace Project.Tests
{
    public class Tests
    {
        [Test]
        public void Setup_Verification_Test()
        {
            // This test ensures your GitHub Action test runner is working
            Assert.Pass("CI/CD Pipeline is successfully running NUnit tests.");
        }
    }
}