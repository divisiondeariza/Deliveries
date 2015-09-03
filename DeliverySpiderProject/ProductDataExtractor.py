'''
Created on 23/08/2015

@author: emmanuel
'''
import json


class ProductDataExtractor(object):
    
    def __init__(self, response):
        self.response =  response
        self.data = json.loads(self.response.body, 'utf-8')
    
    def getRestaurant(self):
        return self.data["establecimiento"]

    
    def restaurantBelongsToTag(self, tag, restaurantsFile):
        return self.restaurantBelongsToTagList([tag], restaurantsFile)

    
    def getProductCategory(self):
        return self.data["categoria"]

    
    def getName(self):
        return self.data["nombre"]

    
    def getDescription(self):
        return self.data["descripcion"]

    
    def getPrice(self):
        return float(self.data["precio"])

    
    def restaurantBelongsToTagList(self, tagList, restaurantsFile):
        restaurantTagCategories = self.getRestaurantCategories(restaurantsFile)
        for tag in tagList:
            if tag in restaurantTagCategories:
                return True
        return False

    
    def getRestaurantCategories(self, restaurantsFile):
        restaurantTagCategories = []
        with open(restaurantsFile, 'rb') as f:
            for row in f:
                restaurant = json.loads(row)
                if self.data["establecimiento_id"] == restaurant["id"]:   
                    restaurantTagCategories = restaurant["tagCategories"]
        return restaurantTagCategories
    

    
    
    
    
    
    
    
    
    
    
    
    
    
    


