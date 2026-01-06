# Tuto-Web-service


Le ppt de tuto est a la racine du projet

Il n'y a pas les vidéos de test postman, ça arrivera prochainement


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
