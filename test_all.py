# coding: utf-8
import unittest
from test_login import TestLogin
from test_inventory import TestInventory
from test_heatmap import TestHeatmap
from test_recommendations import TestRecommendations

# Load all test cases
loader = unittest.TestLoader()
suite = unittest.TestSuite()

suite.addTests(loader.loadTestsFromTestCase(TestLogin))
suite.addTests(loader.loadTestsFromTestCase(TestInventory))
suite.addTests(loader.loadTestsFromTestCase(TestHeatmap))
suite.addTests(loader.loadTestsFromTestCase(TestRecommendations))

# Run tests
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

# Print summary
print("\n" + "="*60)
print("TEST SUMMARY")
print("="*60)
print(f"Total Tests Run: {result.testsRun}")
print(f"Passed: {result.testsRun - len(result.failures) - len(result.errors)}")
print(f"Failed: {len(result.failures)}")
print(f"Errors: {len(result.errors)}")
print("="*60)