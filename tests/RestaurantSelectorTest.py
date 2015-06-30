# -*- coding: utf-8 -*-
'''
Created on 28/06/2015

@author: emmanuel
'''
import unittest
from scrapy.http import TextResponse, Request
import os
from DeliverySpiderProject.RestaurantSelector import RestaurantSelector
from DeliverySpiderProject.items import Dish


def getDishByName(dishes, dishName):
    return next(dish for dish in dishes if dish["name"] == dishName)
         
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

class HenrysExampleTestCase(unittest.TestCase):
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
        payMethods = ["efectivo", u"Débito", u"Crédito", "Sodexo", "Sodexo"]
        self.assertEquals(self.selector.getPayMethods(), payMethods)
        
    def testGetTagCategories(self):
        tagCategories = ["Hamburguesas", "Sanduches", "Perros Calientes"]
        self.assertEquals(self.selector.getTagCategories(), tagCategories)
        
    def testMenuIsAList(self):
        self.assertIsInstance(self.selector.getMenuCategories(), list, "menu is not a list object")

    def testMenuContainsAnyCategory(self):
        categoryNamesInMenu = [category["name"] for category in self.selector.getMenuCategories()]
        self.assertIn("Bebidas", categoryNamesInMenu, "menu does not contains Drinks Category")
    
    def testMenuContainsAlCategories(self):
        self.assertEqual(len(self.selector.getMenuCategories()), 10)
          
    def testGetAveragePunctuation(self):
        self.assertEqual(self.selector.getAveragePunctuation(), 3)

    def testGetQuantityOfComments(self):
        self.assertEqual(self.selector.getQuantityOfComments(), 874)
        
    def testGetDishesIDs(self):
        category = self.selector.getMenuCategories()[1]
        expectedDishesIDs = ["150710", "150711", "150712", "150713", "150714", 
                             "150715", "150716", "150717", "150718", "150719"]
        self.assertEqual(category["dishesIDs"], expectedDishesIDs) 
        
    @unittest.skip("Deprecaded")
    def testMenuCategoryDishesContainsOnlyDishes(self):
        category = next(c for c in self.selector.getMenuCategories() if c["name"] == "Hamburguesas")
        areAllElementsInCategoryDishes = all(isinstance(dish, Dish) for dish in category["dishes"])
        self.assertTrue(areAllElementsInCategoryDishes)

    @unittest.skip("Deprecaded")
    def testGetAllDishesInCategory(self):
        category = next(c for c in self.selector.getMenuCategories() if c["name"] == "Carnes")
        self.assertEquals(len(category["dishes"]), 12, "Not the correct number of dishes")

    @unittest.skip("Deprecaded")    
    def testDescriptionIsNoneIfDishHasNoDescription(self):
        category = next(c for c in self.selector.getMenuCategories() if c["name"] == "Bebidas")
        dish = getDishByName(category["dishes"], "Limonada Natural 12 onzas")
        self.assertEqual(dish["description"], None)    
            
    @unittest.skip("Deprecaded")        
    def testGetCorrectDishDescriptionWhenExist(self):
        category = next(c for c in self.selector.getMenuCategories() if c["name"] == "Salchipapa")
        dish = getDishByName(category["dishes"], "Sanchipapa Maxilunch")
        description = "Salchicha maxilunch y papa a la francesa"
        self.assertEqual(dish["description"], description)
            
    @unittest.skip("Deprecaded")                
    def testGetCorrectPriceWhenExist(self):
        category = next(c for c in self.selector.getMenuCategories() if c["name"] == u"Menú infantil")
        dish = getDishByName(category["dishes"], "Henry Kids")
        price = 11500
        self.assertEqual(dish["price"], price)

        
class RedBoxExampleTestCase(unittest.TestCase):
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