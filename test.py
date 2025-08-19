# NSI 1
# Exo 1

def voisins_entrants(adj, x):
    voisins = []
    for i in range(len(adj)):
        if x in adj[i]:
            voisins.append(i)
    return voisins

# jeux de test exo 1
adj = [[1], [2], [0, 1]]

print(voisins_entrants(adj, 1))  # Doit afficher [0, 2] car 0 et 2 pointent vers 1
print(voisins_entrants(adj, 0))  # Doit afficher [2] car 2 pointe vers 0
print(voisins_entrants(adj, 2))  # Doit afficher [1] car 1 pointe vers 2
print(voisins_entrants(adj, 3))  # Doit afficher [] car aucun sommet ne pointe vers 3

# exo 2

def nombre_suivant(s):
    '''Renvoie le nombre suivant de celui representé par s
    en appliquant le procédé de lecture.'''
    resultat = ''
    chiffre = s[0]
    compte = 1
    for i in range(1, len(s)): 
        if s[i] == chiffre:
            compte = compte + 1
        else:
            resultat += str(compte) + chiffre 
            chiffre = s[i]
            compte = 1
    lecture_chiffre = str(compte) + chiffre 
    resultat += lecture_chiffre
    return resultat


# jeux de test exo 2
print(nombre_suivant("1"))      # Doit afficher '11' (un 1)
print(nombre_suivant("11"))     # Doit afficher '21' (deux 1)
print(nombre_suivant("21"))     # Doit afficher '1211' (un 2, un 1)
print(nombre_suivant("1211"))   # Doit afficher '111221' (un 1, un 2, deux 1)
print(nombre_suivant("111"))    # Doit afficher '31' (trois 1)
print(nombre_suivant("112221")) # Doit afficher '2132211' (deux 1, trois 2, un 1)
print(nombre_suivant('311'))

# NSI 2
# Exo 1

def max_et_indice(tab):
    indice = 0
    for i in range(1, len(tab)):
        if tab[indice] < tab[i]:
            indice = i
    return tab[indice], indice

print(max_et_indice([1, 5, 6, 9, 1, 2, 3, 7, 9, 8]))
print(max_et_indice([-2]))
print(max_et_indice([-1, -1, 3, 3, 3]))

# Exo 2

def est_un_ordre(tab):
    '''
    Renvoie True si tab est de longueur n et contient tous les
    entiers de 1 à n, False sinon
    '''
    n = len(tab)
    # les entiers vus lors du parcours
    vus = []

    for x in tab:
        if x < 1 or x > n or x in vus: 
            return False
        vus.append(x) 
    return True

def nombre_points_rupture(ordre):
    '''
    Renvoie le nombre de point de rupture de ordre qui représente 
    un ordre de gènes de chromosome
    '''
    # on vérifie que ordre est un ordre de gènes
    assert est_un_ordre(ordre)
    n = len(ordre)
    nb = 0
    if ordre[0] != 1: # le premier n'est pas 1 
        nb = nb + 1
    i = 0
    while i < n: 
        if ordre[i+1] - ordre[i] not in [-1, 1]: # l'écart n'est pas 1 
            nb = nb + 1
        i = i + 1
    if ordre[i] != n: # le dernier n'est pas n 
        nb = nb + 1
    return nb


# NSI 3
# Exo 1

def fibonacci(n):
    if n == 0:
        return 0
    if n == 1:
        return 1
    return fibonacci(n-1) + fibonacci(n-2)
print(fibonacci(2))

# Exo 2

def eleves_du_mois(eleves, notes):
    note_maxi = 0
    meilleurs_eleves = []

    for i in range(len(notes)): 
        if notes[i] == note_maxi: 
            meilleurs_eleves.append(eleves[i]) 
        elif notes[i] > note_maxi:
            note_maxi = notes[i]
            meilleurs_eleves = [eleves[i]] 

    return (note_maxi, meilleurs_eleves)

eleves_nsi = ['a','b','c','d','e','f','g','h','i','j']
notes_nsi = [30, 40, 80, 60, 58, 80, 75, 80, 60, 24]
print(eleves_du_mois(eleves_nsi, notes_nsi))

# NSI 4
# Exo 1
def ecriture_binaire_entier_positif(n):
    '''Renvoie une chaîne représentant n en binaire sans utiliser bin()'''
    if n == 0:
        return '0'
    bits = []
    while n > 0:
        bits.append(str(n % 2))
        n = n // 2
    bits.reverse()
    return ''.join(bits)
        
# Exo 2
def echange(tab, i, j):
    '''Echange les éléments d'indice i et j dans le tableau tab.'''
    temp = tab[i]
    tab[i] = tab[j]
    tab[j] = temp

def tri_bulles(tab):
    '''Trie le tableau tab dans l'ordre croissant
    par la méthode du tri à bulles.'''
    n = len(tab)
    for i in range(n): 
        for j in range(0, n - 1 - i): 
            if tab[i] < tab[j]: 
                echange(tab, j, i) 

tab2 = [9, 3, 7, 2, 3, 1, 6]
tri_bulles(tab2)
print(tab2)

# NSI 5
# Exo 1

def renverse(mot):
    s = ''
    n = len(mot)
    for i in range(n):
        s += mot[n - 1 - i]

    return s

print(renverse('La maison de la meditteranenee'))


# Exo 2

def crible(n):
    """Renvoie un tableau contenant tous les nombres premiers
    plus petits que n."""
    premiers = []
    tab = [True] * n
    tab[0], tab[1] = False, False
    for i in range(n):
        if tab[i]:
            premiers.append(i)
            multiple = 2 * i
            while multiple < n:
                tab[multiple] = False
                multiple = multiple + 1
    return premiers


# NSI 6
# Exo 1

def liste_puissances(a, borne):
    liste = []
    for i in range(1, borne+1):
        s = a
        for _ in range(i - 1):
            s = s * a
        liste.append(s)
    return liste

print(liste_puissances(3, 5))

def liste_puissances_borne(a, borne):
    if borne <= a:
        return []
    liste = []
    for i in range(1, borne + 1):
        s = a
        for _ in range(i - 1):
            s = s * a
        if s < borne:
            liste.append(s)
        else:
            return liste
        
    return liste

print(liste_puissances_borne(2, 200))
    
# exo 2
dico = {"A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6,
        "G": 7, "H": 8, "I": 9, "J": 10, "K": 11, "L": 12,
        "M": 13, "N": 14, "O": 15, "P": 16, "Q": 17,
        "R": 18, "S": 19, "T": 20, "U": 21, "V": 22,
        "W": 23, "X": 24, "Y": 25, "Z": 26}

def codes_parfait(mot):
    """Renvoie un triplet 
    (code_additionne, code_concatene, mot_est_parfait) où :
    - code_additionne est la somme des codes des lettres du mot ;
    - code_concatene est le code des lettres du mot concaténées ;
    - mot_est_parfait est un booléen indiquant si le mot est parfait."""
    code_concatene = ""
    code_additionne = 0
    for c in mot:
        code_concatene = code_concatene + str(dico[c])
        code_additionne = code_additionne + dico[c]
    code_concatene = int(code_concatene)
    mot_est_parfait = int(code_concatene) % code_additionne == 0
    return code_additionne, code_concatene, mot_est_parfait

print(codes_parfait("ALAIN"))

# NSI 7
# EXO 1
def nbr_occurrences(chaine):
    occ = {}
    for c in chaine:
        if c in occ:
            occ[c] += 1
        else:
            occ[c] = 1
    return occ

print(nbr_occurrences("Hello world !"))

# EXO 2

def fusion(tab1,tab2):
    '''Fusionne deux tableaux triés et renvoie
    le nouveau tableau trié.'''
    n1 = len(tab1)
    n2 = len(tab2)
    tab12 = [0] * (n1 + n2)
    i1 = 0
    i2 = 0
    i = 0
    while i1 < n1 and i2 < n2: 
        if tab1[i1] < tab2[i2]:
            tab12[i] = tab1[i1]
            i1 = i1 + 1
        else:
            tab12[i] = tab2[i2]
            i2 = i2 + 1
        i += 1
    while i1 < n1:
        tab12[i] = tab1[i1]
        i1 = i1 + 1
        i = i + 1
    while i2 < n2:
        tab12[i] = tab2[i2]
        i2 = i2 + 1
        i = i + 1
    return tab12

print( fusion([1,2,3],[]))
print(fusion([1, 6, 10],[0, 7, 8, 9]))

# NSI 8
# exo 1

def maximum_tableau(tab):
    ''' ON SUPPOSE QUE LE TABLEAU NEST PAS VIDE'''
    biggest = tab[0]
    for i in range(1, len(tab)):
        if tab[i] > biggest:
            biggest = tab[i]
    
    return biggest


class Pile:
    """Classe définissant une structure de pile."""
    def __init__(self):
        self.contenu = []

    def est_vide(self):
        """Renvoie un booléen indiquant si la pile est vide."""
        return self.contenu == []

    def empiler(self, v):
        """Place l'élément v au sommet de la pile"""
        self.contenu.append(v)

    def depiler(self):
        """
        Retire et renvoie l'élément placé au sommet de la pile,
        si la pile n’est pas vide. Produit une erreur sinon.
        """
        assert not self.est_vide()
        return self.contenu.pop()

def bon_parenthesage(ch):
    """Renvoie un booléen indiquant si la chaîne ch 
    est bien parenthésée"""
    p = Pile()
    for c in ch:
        if c == '(': 
            p.empiler(c)
        elif c == ')': 
            if p.est_vide():
                return False
            else:
                p.depiler()
    return p.est_vide()

print( bon_parenthesage("(())(()"))


# NSI 9
#exo 1

def multiplication(n1, n2):
    positif = True
    for n in [n1, n2]:
        if n < 0:
            positif = not positif

    s = 0
    for _ in range(abs(n1)):
        s += abs(n2)

    return s if positif else -s


print(multiplication(-3, -5))

# exo 2
def dichotomie(tab, x):
    """
    tab : tableau d'entiers trié dans l'ordre croissant
    x : nombre entier
    La fonction renvoie True si tab contient x et False sinon
    """
    debut = 0
    fin = len(tab) - 1
    while debut <= fin:
        m = (debut + fin) // 2
        if x == tab[m]:
            return True
        if x > tab[m]:
            debut = m + 1
        else:
            fin = m - 1
    return False

# NSI 10
# exo 1

def recherche(tab, n):
    for i in range(len(tab)):
        if tab[i] == n:
            return i


# exo 2
alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

def position_alphabet(lettre):
    '''Renvoie la position de la lettre dans l'alphabet'''
    return ord(lettre) - ord('A')

def cesar(message, decalage):
    '''Renvoie le message codé par la méthode de César
    pour le decalage donné'''
    resultat = ''
    for c in message: 
        if 'A' <= c and c <= 'Z':
            indice = (position_alphabet(c)) % 26 
            resultat = resultat + alphabet[indice]
        else:
            resultat = resultat + c
    return resultat

# NSI 11
# exo 1
def parcours_largeur(arbre):
    """
    Renvoie la liste des étiquettes des nœuds de l'arbre binaire parcourus en largeur.
    arbre : soit None, soit un triplet (g, x, d)
    """
    if arbre is None:
        return []
    file = [arbre]
    resultat = []
    while file:
        noeud = file.pop(0)
        g, x, d = noeud
        resultat.append(x)
        if g is not None:
            file.append(g)
        if d is not None:
            file.append(d)
    return resultat

arbre = ( ( (None, 1, None), 2, (None, 3, None) ),
4,
( (None, 5, None), 6, (None, 7, None) ) )

# exo 2
def somme_max(tab):
    n = len(tab)
    sommes_max = [0] * n
    sommes_max[0] = tab[0]
    # on calcule la plus grande somme se terminant en i
    for i in range(1, n):
        if sommes_max[i-1] + tab[i] > tab[i]:
            sommes_max[i] = sommes_max[i-1] + tab[i]
        else:
            sommes_max[i] = tab[i]
    # on en déduit la plus grande somme de celles-ci
    maximum = 0
    for i in range(1, n):
        if sommes_max[i] > sommes_max[maximum]:
            maximum = i
    return sommes_max[maximum]

# NSI 12
# exo 1

def fusion(tab1, tab2):
    i1 = 0
    i2 = 0
    tab = []

    while i1 < len(tab1) and i2 < len(tab2):
        if tab1[i1] <= tab2[i2]:
            tab.append(tab1[i1])
            i1 += 1
        elif tab1[i1] > tab2[i2]:
            tab.append(tab2[i2])
            i2 += 1
    print(i1, i2)
        
    if i1 < len(tab1):
        tab += tab1[i1:]
    if i2 < len(tab2):
        tab += tab2[i2:]
    return tab


print(fusion([1,2, 495439],[2,5, 99]))

# exo 2
romains = {"I":1, "V":5, "X":10, "L":50, "C":100, "D":500, "M":1000}

def traduire_romain(nombre):
    """ Renvoie l'écriture décimale du nombre donné en chiffres
    romains """
    if len(nombre) == 1:
        return romains[nombre]
    
    elif romains[nombre[0]] >= romains[nombre[1]]:
        return romains[nombre[0]] + traduire_romain(nombre[1:])
    else:
        return traduire_romain(nombre[1:]) - romains[nombre[0]]

def ajouter_mot_dict(dict_mots, mot):
    c = code_hachage(mot)
    if c in dict_mots:
        dict_mots[c] = ajouter_mot_liste(dict_mots[c], mot)
    else:
        dict_mots[c] = [mot]
    
def planning(f):
    todo = [[f.defiler()]]
    vus = []

    while not f.est_vide():
        p = f.defiler()
        if todo[-1][1] == p[1]:
            todo[-1].append(p[0])
        else:
            todo.append([p])
    
    i = 0
    while i < len(todo):
        j,n= 0, len(todo[i])
        while todo[i] != []:
            p = todo[i][j % n]
            p.avancer()
            vus.append(p)
            if p.est_terminee():
                todo[i].pop(j % n)
                n -= 1
            else:
                j += 1
        i += 1

    return vus

