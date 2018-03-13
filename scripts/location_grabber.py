from bs4 import BeautifulSoup

with open("scripts/directory.html") as d:
	soup = BeautifulSoup(d)

print(soup)