from bs4 import BeautifulSoup

# https://aggiemap.tamu.edu/directory/
with open("scripts/directory.html") as d:
	soup = BeautifulSoup(d)

for item in soup.find_all('td'):
	print(item.a.get('href')),
	print(item.string)

