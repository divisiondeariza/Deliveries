'''
Created on 4/07/2015

@author: emmanuel
'''

class ProductLinkGetter(object):
    '''
    classdocs
    '''


    def __init__(self):
        '''
        Constructor
        '''

    
    def getLink(self, id):
        if id.isdigit():
            link = "http://www.domiciliosbogota.com/establecimientos/producto/" + id
            return link
        else:
            return None
    
    
        