# Motus App

## Description 

Application permettant de jouer au motus. Jeu programmé en Javascript avec Node.js et Express.js.

## Regle du jeu

Le but du jeu est de trouver un mot dont le nombre de lettre est donné tout en utilisant le moins d'essais possible. Après chaque essais, les lettres bien placées s'affichent en vert, 
les lettres mal placées mais appartenant au mot recherché s'affichent en orange et les lettres qui n'appartiennent pas au mot s'affichent en rouge. Le mot à trouver change chaque jour.

## Lancement de l'application
 
Aller dans le dossier motus
 
 ```
cd motus
 ```

Lancer l'application

```
sudo chmod ugo+rwx  data/redis/dump.rdb
docker-compose up --build
```

Aller à http://localhost:3001

## Diagrammes de séquence

### Inscription
```mermaid
sequenceDiagram
    Client ->> Motus serveur: /
    Note right of Motus serveur: Si l'utilisateur n'est pas connecté
    Motus serveur ->> Oauth serveur: /authorize
    Oauth serveur ->> Oauth serveur: Vérifie les paramètres OpenID
    Note left of Oauth serveur: Si les paramètres sont bons
    Oauth serveur->>Client: login.html
    Client ->> Oauth serveur: register
    Oauth serveur ->> Client : register.html
    Client ->> Oauth serveur: Envoi l'identifiant et le mot de passe
    Oauth serveur ->> serveur Redis: verifie si l'identifiant existe déjà
    serveur Redis ->> Oauth serveur: envoi les données liées à l'identifiant
    Note left of Oauth serveur: Si les données sont vides et les deux mots de passe sont identiques
    Oauth serveur ->> serveur Redis: ajoute l'identifiant à la base
```

### Connexion

```mermaid
sequenceDiagram
    Client ->> Motus serveur: /
    Note right of Motus serveur: Si l'utilisateur n'est pas connecté
    Motus serveur ->> Oauth serveur: /authorize
    Oauth serveur ->> Oauth serveur: Vérifie les paramètres OpenID
    Note left of Oauth serveur: Si les paramètres sont bons
    Oauth serveur->>Client: login.html
    Client ->> Oauth serveur: /check-login
    Oauth serveur ->> serveur Redis: récupere les données liées à l'identifiant entré par l'utilisateur
    serveur Redis -->> Oauth serveur: envoi les données
    Oauth serveur ->> Oauth serveur: Vérifie l'authentification
    Note left of Oauth serveur: Si l'authentification est bonne
    Oauth serveur ->> Oauth serveur: Crée le code
    Oauth serveur ->> Motus serveur : /callback?code
    Motus serveur ->> Oauth serveur: /token?code
    Oauth serveur -->> Motus serveur: return idToken
    Motus serveur ->> Motus serveur: req.session.user = decodedToken
    Motus serveur ->> Client: /index.html
```
### Déroulement du jeu
```mermaid
sequenceDiagram
    Client ->> Motus serveur: /
    Note left of Motus serveur: Si l'utilisateur est connecté
    Motus serveur -->> Client: /index.html
    Note right of Client: L'utilisateur saisit un mot
    Client ->> Motus serveur: /check-word
    Note right of Motus serveur: Si le mot saisi a la bonne longueur
    Motus serveur ->> Motus serveur: Compare le mot saisi avec le mot à deviner et stocke le nombre d'essais
    Motus serveur -->> Client: return result
    Note left of Client: Si l'utilisateur devine le mot
    Client ->> Motus serveur: /check-word
    Motus serveur ->> Score serveur: /setscore
    Score serveur ->> Score serveur: Récupère le nombre d'essais
    Note right of Score serveur: Récupère les données
    Score serveur ->> serveur Redis: client.get('nb_words_found')
    serveur Redis -->> Score serveur: 
    Score serveur ->> serveur Redis: client.get('total_nb_try')
    serveur Redis -->> Score serveur: 
    Note right of Score serveur: Met à jour les données
    Score serveur ->> serveur Redis: client.set('nb_words_found')
    Score serveur ->> serveur Redis: client.set('total_nb_try')
    Score serveur ->> serveur Redis: client.set('average_try')
    Score serveur ->> Motus serveur: res.send('Score set succesfully')
    Motus serveur -->> Client: return result
```

## Axes d'améliorations


