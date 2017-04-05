# paw-tracks
Motion Recording Firmware and Analytics


# Set Up

1. Use the navio image
2. SSH in:

```
ssh pi@navio.local   # password: raspberry
```

3. Edit /etc/hosts to have a hostname of `paw-tracks`
4. Edit /etc/hostname
5. Run
```
sudo /etc/init.d/hostname.sh
```
6. Reboot
7. Set up SSH keys
8.

```
sudo adduser dingo # use whatever password you want
sudo visudo

# exit ssh

ssh-keygen -t rsa -C dingo@paw-tracks.local # save to ~/.ssh/paw-tracks
cat ~/.ssh/paw-tracks.pub | ssh dingo@paw-tracks.local 'cat >> .ssh/authorized_keys'


ssh dingo@paw-tracks.local

sudo userdel -r pi
```


Run the playbook:
```
sudo ansible-galaxy install geerlingguy.nodejs


ansible-playbook -i ansible/inventories/tracker/hosts ansible/site.yml
```
