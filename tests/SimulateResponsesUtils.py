'''
Created on 7/07/2015

@author: emmanuel
'''
from scrapy.http.response.text import TextResponse
from scrapy.http.request import Request
import os

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