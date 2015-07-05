# -*- coding: utf-8 -*-
'''
Created on 28/06/2015

@author: emmanuel
'''
import unittest
from scrapy.http import TextResponse, Request
import os
from DeliverySpiderProject.RestaurantSelector import RestaurantSelector
         
def fakeResponseFromFile(file_name, url=None):
    if not url:
        url = 'http://www.example.com'
    file_path = getAbsolutePath(file_name)
    file_content = open(file_path, 'r').read()
    response = TextResponse(url=url,
        request=Request(url=url),
        body=file_content)
    return response

def getAbsolutePath(file_name):
    if not file_name[0] == '/':
        responses_dir = os.path.dirname(os.path.realpath(__file__))
        return os.path.join(responses_dir, file_name)
    else:
        return file_name

class RestaurantBasicDataTestCase(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/HenrysExample", None)
        self.selector = RestaurantSelector(response)

    def tearDown(self):
        self.selector = None
        
    def testGetName(self):
        self.assertEquals(self.selector.getName(), "Henrys")
 
    @unittest.skip("not implemented")       
    def testGetID(self):
        self.assertEqual(self.selector.getID(), 6980)
        
    def testGetDeliveryTimeInMinutes(self):
        self.assertEquals(self.selector.getDeliveryTimeInMinutes(), 45) 
        
    def testGetMinOrderPrice(self):
        self.assertEquals(self.selector.getMinOrderPrice(), 12000)

    def testGetDeliveryCost(self):
        self.assertEqual(self.selector.getDeliveryCost(), 3500)
        
    def testGetPayMethods(self):
        payMethods = ["efectivo", u"Débito", u"Crédito", "Sodexo", "Sodexo"]
        self.assertEquals(self.selector.getPayMethods(), payMethods)
        
    def testGetTagCategories(self):
        tagCategories = ["Hamburguesas", "Sanduches", "Perros Calientes"]
        self.assertEquals(self.selector.getTagCategories(), tagCategories)
          
    def testGetAveragePunctuation(self):
        self.assertEqual(self.selector.getAveragePunctuation(), 3)

    def testGetQuantityOfComments(self):
        self.assertEqual(self.selector.getQuantityOfComments(), 874)
        
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
    
class ExceptionalDataTestCase(unittest.TestCase):
    def setUp(self):
        response = fakeResponseFromFile("examples/RedBoxExample", None)
        self.selector = RestaurantSelector(response)

    def tearDown(self):
        self.item = None
       
    def testMinOrderPriceIsZeroWhenRestaurantHasNotMinPrice(self):
        self.assertEquals(self.selector.getMinOrderPrice(), 0)
        

if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()