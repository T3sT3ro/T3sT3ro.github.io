import random as random
from collections import OrderedDict
l = [random.randint(1,100) for _ in range(100)]
l = list(OrderedDict.fromkeys(l))
print(len(l))
print( ' '.join(str(e) for e in l))
