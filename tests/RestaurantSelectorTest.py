# -*- coding: utf-8 -*-
'''
Created on 28/06/2015

@author: emmanuel
'''
import unittest
from DeliverySpiderProject.RestaurantSelector import RestaurantSelector
from tests.SimulateResponsesUtils import fakeResponseFromFile

class RestaurantBasicDataTestCase(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/HenrysExample", None)
        self.selector = RestaurantSelector(response)

    def tearDown(self):
        self.selector = None
        
    def testGetName(self):
        self.assertEquals(self.selector.getName(), "Henrys")
        
    def testGetDeliveryTimeInMinutes(self):
        self.assertEquals(self.selector.getDeliveryTimeInMinutes(), 45) 
        
    def testGetMinOrderPrice(self):
        self.assertEquals(self.selector.getMinOrderPrice(), 12000)

    def testGetDeliveryCost(self):
        self.assertEqual(self.selector.getDeliveryCost(), 3500)
        
    def testGetPayMethods(self):
        payMethods = ["pago-efectivo", u"pago-debito", u"pago-credito", "pago-sodexo", "pago-sodexo"]
        self.assertEquals(self.selector.getPayMethods(), payMethods)
        
    def testGetTagCategories(self):
        tagCategories = ["Hamburguesas", "Sanduches", "Perros Calientes"]
        self.assertEquals(self.selector.getTagCategories(), tagCategories)
          
    def testGetAveragePunctuation(self):
        self.assertEqual(self.selector.getAveragePunctuation(), 3)

    def testGetQuantityOfComments(self):
        self.assertEqual(self.selector.getQuantityOfComments(), 874)
        
    def testHasTagsFromList(self):          
        categoriesList = ["Comida Colombiana", 
                          "Comida Vegetariana", 
                          "Ensaladas", 
                          "Sanduches", 
                          "Sopas", 
                          "Comida Saludable"]
        hasTagsFromList = self.selector.hasTagsFromList(categoriesList)
        self.assertTrue(hasTagsFromList)
        
class MenuDataTestCase(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/HenrysExample", None)
        self.selector = RestaurantSelector(response)

    def tearDown(self):
        self.selector = None
        
    def testMenuIsAList(self):
        self.assertIsInstance(self.selector.getMenuCategories(), list, "menu is not a list object")

    def testMenuContainsAnyCategory(self):
        categoryNamesInMenu = [category["name"] for category in self.selector.getMenuCategories()]
        self.assertIn("Bebidas", categoryNamesInMenu, "menu does not contains Drinks Category")
    
    def testMenuContainsAlCategories(self):
        self.assertEqual(len(self.selector.getMenuCategories()), 10)    
        
    def testGetProductIDs(self):
        category = self.selector.getMenuCategories()[1]
        expectedProductIDs = ["150710", "150711", "150712", "150713", "150714", 
                             "150715", "150716", "150717", "150718", "150719"]
        self.assertEqual(category["productIDs"], expectedProductIDs)
    
    def testGetTotalProductsOnMenu(self):
        numberOfProducts = self.selector.getNumberOfProducts()
        self.assertEqual(numberOfProducts, 80)
        
    def testGetMeanProductsPerCategory(self):
        meanProductsPerCategory = self.selector.getMeanProductsPerCategory()
        self.assertEquals(meanProductsPerCategory, 8)

        
class DataStatisticsTest(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/SmallDataEven", None)
        self.selector = RestaurantSelector(response)  

    def tearDown(self):
        self.item = None
        
    def testGetCheapestProductPrice(self):
        cheapestPrice = self.selector.getCheapestPriceForProduct()
        self.assertEqual(cheapestPrice, 3000)   
    
    def testGetMostExpensiveProductPrice(self):
        MostExpensivePrice = self.selector.getMostExpensivePriceForProduct()
        self.assertEqual(MostExpensivePrice, 3500)

    def testGetMedianOfPrices(self):
        median = self.selector.getMedianOfPrices()
        self.assertEqual(median, 3250)       
    
    def testGetMeanOfPrices(self):
        mean = self.selector.getMeanOfPrices()
        self.assertEqual(mean, 3250)

class PayMethodsTest(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/HenrysExample", None)
        self.selector = RestaurantSelector(response)

    def tearDown(self):
        self.selector = None

    def testAcceptsCash(self):
        acceptsCash = self.selector.acceptsCash()
        self.assertTrue(acceptsCash)

    def testAcceptsCredit(self):
        acceptsCredit = self.selector.acceptsCredit()
        self.assertTrue(acceptsCredit)      

    def testAcceptsDebit(self):
        acceptsDebit = self.selector.acceptsDebit()
        self.assertTrue(acceptsDebit)      

    def testAcceptsSodexo(self):
        acceptsSodexo = self.selector.acceptsSodexo()
        self.assertTrue(acceptsSodexo)    
                        
class NoCategoriesInDataTest(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/NoCategoriesExample", None)
        self.selector = RestaurantSelector(response)  

    def tearDown(self):
        self.item = None
    
    def testGetMeanProductsPerCategoryWhenNoCategory(self):
        meanProductsPerCategory = self.selector.getMeanProductsPerCategory()
        self.assertEqual(meanProductsPerCategory, 0)
        
    def testGetCheapestProductPrice(self):
        cheapestPrice = self.selector.getCheapestPriceForProduct()
        self.assertEqual(cheapestPrice, 0)   
    
    def testGetMostExpensiveProductPrice(self):
        MostExpensivePrice = self.selector.getMostExpensivePriceForProduct()
        self.assertEqual(MostExpensivePrice, 0)
 
        
class ExceptionalDataTestCase(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/RedBoxExample", None)
        self.selector = RestaurantSelector(response)

    def tearDown(self):
        self.item = None
       
    def testMinOrderPriceIsZeroWhenRestaurantHasNotMinPrice(self):
        self.assertEquals(self.selector.getMinOrderPrice(), 0)

    def testHasNoTagsFromList(self):
        categoriesList = ["Comida Colombiana", 
                          "Comida Vegetariana", 
                          "Ensaladas", 
                          "Sanduches", 
                          "Sopas", 
                          "Comida Saludable"]
        hasTagsFromList = self.selector.hasTagsFromList(categoriesList)
        self.assertFalse(hasTagsFromList)


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()