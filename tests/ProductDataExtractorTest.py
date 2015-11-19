# -*- coding: utf-8 -*-
'''
Created on 23/08/2015

@author: emmanuel
'''
import unittest
from tests.SimulateResponsesUtils import fakeResponseFromFile, getAbsolutePath
from DeliverySpiderProject import ProductDataExtractor


class ProductDataExtractorTest(unittest.TestCase):

    def setUp(self):
        response = fakeResponseFromFile("examples/ProductExample.json", None)
        self.productDataExtractor = ProductDataExtractor.ProductDataExtractor(response)
        self.restaurantsFile = getAbsolutePath("examples/restaurants.json")
        
    def tearDown(self):
        pass
    
    def testGetRestaurant(self):
        restaurant = self.productDataExtractor.getRestaurant()
        self.assertEqual(restaurant, u"Maos Pizza")
    

    def testProductRestaurantBelongsToTag(self):
        belongsToTag = self.productDataExtractor.restaurantBelongsToTag("Pizza", self.restaurantsFile)
        self.assertTrue(belongsToTag)
        
    def testProductRestaurantDoesNotBelongsToTag(self):
        belongsToTag = self.productDataExtractor.restaurantBelongsToTag("Non-existent-tag", self.restaurantsFile)
        self.assertFalse(belongsToTag)
        
    def testProductRestaurantBelongsToTagList(self):
        tagList = ["Comida Colombiana", 
                   "Comida Vegetariana", 
                   "Ensalada", 
                   "Sanduches",
                   "Comida Colombiana", 
                   "Comida Saludable",
                   "Pizza"]
        belongsToTagList = self.productDataExtractor.restaurantBelongsToTagList(tagList, self.restaurantsFile)
        self.assertTrue(belongsToTagList)        
 
    def testProductRestaurantDoesNotBelongsToTagList(self):
        tagList = ["Comida Colombiana", 
                   "Comida Vegetariana", 
                   "Ensalada", 
                   "Sanduches",
                   "Comida Colombiana", 
                   "Comida Saludable"]
        belongsToTagList = self.productDataExtractor.restaurantBelongsToTagList(tagList, self.restaurantsFile)
        self.assertFalse(belongsToTagList)        
        
    def testGetProductCategory(self):
        productCategory =  self.productDataExtractor.getProductCategory()
        self.assertEqual(productCategory, "Pizzas Tradicionales")
        
    def testGetName(self):
        name = self.productDataExtractor.getName()
        self.assertEqual(name, u"Pizza Pollo Champiñón")
        
    def testGetDescription(self):
        description = self.productDataExtractor.getDescription()
        self.assertEqual(description, u"Pizza con champiñón and stuff")
        
    def testGetPrice(self):
        price = self.productDataExtractor.getPrice()
        self.assertEqual(price, 9000)
        
    def testGetRestaurantCategories(self):
        restaurantCategories = self.productDataExtractor.getRestaurantCategories(self.restaurantsFile)
        self.assertListEqual(restaurantCategories, ["Pizza", "Nuevos Restaurantes"])
    
    def testGetEmptyRestaurantCategoriesListWhenNoRestaurantFound(self):
        restautantsEmptyFile = getAbsolutePath("examples/restaurantsEmpty.json")
        restaurantCategories = self.productDataExtractor.getRestaurantCategories(restautantsEmptyFile)
        self.assertListEqual(restaurantCategories, [])
        
                
if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()