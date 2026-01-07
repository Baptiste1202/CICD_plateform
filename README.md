# CICD_plateform test

# 1. Préparation de l'environnement Cloud

## Configurer accès SSH
1. Installation du serveur SSH sur Ubuntu
Ouvrez le terminal de votre machine virtuelle Ubuntu et exécutez les commandes suivantes :

Installer OpenSSH : sudo apt update && sudo apt install openssh-server.

Vérifier le statut : sudo systemctl status ssh. Le statut doit être "active (running)".

Ouvrir le pare-feu : sudo ufw allow ssh ou sudo ufw allow 22/tcp pour autoriser les connexions entrantes.

2. Configuration réseau (VirtualBox / UTM)
Pour que votre machine hôte (votre PC) puisse "voir" la VM, vous avez deux options principales :

Méthode,Configuration,Usage
Accès par pont (Bridge),La VM reçoit une adresse IP de votre box (ex: 192.168.1.30).,Plus simple si vous êtes sur un réseau stable.
NAT avec redirection,Vous redirigez le port 2222 de l'hôte vers le port 22 de la VM.,Idéal pour isoler la VM ou si le réseau restreint les IP.

Pour la redirection de port (NAT) sur VirtualBox :

Allez dans Configuration > Réseau > Avancé > Redirection de ports.

Ajoutez une règle : Hôte IP: 127.0.0.1, Port hôte: 2222, IP invité: (laisser vide), Port invité: 22.

3. Connexion par Clé SSH (Obligatoire pour le CI/CD)
Pour automatiser le déploiement sans taper de mot de passe à chaque fois, utilisez des clés SSH.

Générer une clé sur votre machine hôte : ssh-keygen -t rsa -b 4096.

Copier la clé sur la VM : ssh-copy-id -p 2222 user@127.0.0.1 (en remplaçant par votre utilisateur et le port choisi).

Tester : ssh -p 2222 user@127.0.0.1. Vous devriez être connecté sans mot de passe.


# Modification Application CI/CD

1. Architecture de votre application CI/CD

Système d'authentification OAuth2 : Intégrez Google ou GitHub dès le départ pour sécuriser l'accès à votre outil.


Gestion des rôles : Implémentez des niveaux d'accès (ex: Admin peut déployer, Viewer peut seulement voir le pipeline).

2. Le Pipeline de déploiement (Le cœur de l'app)
Votre application CI/CD doit automatiser les tâches suivantes dans l'ordre:


Récupération du code : Utilisez une librairie Git (comme JGit en Java) pour cloner le dépôt GitHub de votre projet métier sur la machine où tourne la CI/CD.


Compilation et Tests : Lancez une commande système (mvn clean package) pour compiler le code et exécuter les tests unitaires.


Analyse de qualité : Intégrez un scan SonarQube pour vérifier la qualité du code.


Création de l'image Docker : Générez l'image Docker de votre application (docker build).

3. Le déploiement distant (Lien avec la VM)
C'est ici que votre configuration SSH devient utile. Votre application CI/CD doit :


Se connecter en SSH à la VM Ubuntu.

Transférer l'image ou les instructions (ex: docker compose up) vers la VM.


Démarrer l'application sur la VM via Docker.

4. Interface Utilisateur (IHM)
Le sujet demande une interface visuelle pour suivre le processus:

Affichez chaque étape (Build -> Test -> Docker -> Deploy) avec un indicateur de succès ou d'échec en temps réel.

Prévoyez un bouton "Lancer le déploiement" ou configurez un Webhook GitHub pour que le pipeline se lance tout seul lors d'un push.

## .env client boilerplate:

VITE_API_URL=http://localhost:3000

VITE_FIREBASE_API_KEY=AIzaSyAYN4CBKJ4NbNtn7Ku3RG5cOcZE0aVlR64
VITE_FIREBASE_AUTH_DOMAIN=oauth-cloud-securise.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oauth-cloud-securise
VITE_FIREBASE_STORAGE_BUCKET=oauth-cloud-securise.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=29134834420
VITE_FIREBASE_APP_ID=1:29134834420:web:5ebc2a77df7c2811266ca1
