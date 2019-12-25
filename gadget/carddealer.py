import time
import logging
import threading
import json

from ev3dev2.sound import Sound
from ev3dev2.led import Leds
from ev3dev2.motor import OUTPUT_A, OUTPUT_B, LargeMotor

from agt import AlexaGadget

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MindstormsCardDealerGadget(AlexaGadget):
    # Enabled Alexa device communication by extending from AlexaGadget
    def __init__(self):
        # Performs Alexa Gadget initialization routines and ev3dev resource allocation.
        super().__init__()

        self.leds = Leds()
        self.sound = Sound()
        self.deal_motor = LargeMotor(OUTPUT_A)
        self.rotate_motor = LargeMotor(OUTPUT_B)

    def on_connected(self, device_addr):
        # Gadget connected to the paired Echo device.
        # :param device_addr: the address of the device we connected to

        self.leds.set_color("LEFT", "GREEN")
        self.leds.set_color("RIGHT", "GREEN")
        print("{} connected to Echo device".format(self.friendly_name))

    def on_disconnected(self, device_addr):
        # Gadget disconnected from the paired Echo device.
        # :param device_addr: the address of the device we disconnected from

        self.leds.set_color("LEFT", "BLACK")
        self.leds.set_color("RIGHT", "BLACK")
        print("{} disconnected from Echo device".format(self.friendly_name))

    def on_custom_card_dealer_gadget_reset(self, directive):
        print('on_custom_card_dealer_gadget_reset')
        self.sound.play_song((('C4', 'e'), ('D4', 'e'), ('E5', 'q')))

    def on_custom_card_dealer_gadget_deal(self, directive):
        print('on_custom_card_dealer_gadget_deal')
        # get the payload with the number of players and cards
        payload = json.loads(directive.payload.decode("utf-8"))
        # gets the number of degree between players
        degreeMove = 360 / int(payload['count'])

        cardDealCount = 0
        while cardDealCount < int(payload['cardCount']):
            print('cardDealCount')
            print(cardDealCount)
            playerCount = 0
            while playerCount < int(payload['count']):
                # deal a card
                self.deal_motor.stop_action = 'hold'
                self.deal_motor.run_to_rel_pos(position_sp=241, speed_sp=400)
                self.deal_motor.wait_while('running')

                playerCount += 1
                time.sleep(0.2)

                if playerCount < int(payload['count']):
                    # rotate to next player
                    self.rotate_motor.stop_action = 'hold'
                    self.rotate_motor.run_to_rel_pos(
                        position_sp=degreeMove, speed_sp=200)
                    self.rotate_motor.wait_while('running')

                if playerCount == int(payload['count']):
                    # return to the first player location
                    returnDegree = (
                        degreeMove * (int(payload['count']) - 1)) * -1
                    self.rotate_motor.stop_action = 'hold'
                    self.rotate_motor.run_to_rel_pos(
                        position_sp=returnDegree, speed_sp=200)
                    self.rotate_motor.wait_while('running')
                    cardDealCount += 1

    def on_custom_card_dealer_gadget_pickup52(self, directive):
        print('on_custom_card_dealer_gadget_pickup52')
        pickup52Count = 0
        while pickup52Count < 53:
            # spit out a card
            self.deal_motor.stop_action = 'hold'
            self.deal_motor.run_to_rel_pos(position_sp=245, speed_sp=800)
            self.deal_motor.wait_while('running')
            # rotate 2 degrees
            self.rotate_motor.stop_action = 'hold'
            self.rotate_motor.run_to_rel_pos(position_sp=2, speed_sp=400)
            self.rotate_motor.wait_while('running')
            pickup52Count += 1
            print(pickup52Count)

    def on_custom_card_dealer_gadget_playercard(self, directive):
        print('on_custom_card_dealer_gadget_playercard')
        payload = json.loads(directive.payload.decode("utf-8"))
        # rotate to specific player
        self.rotate_motor.stop_action = 'hold'
        self.rotate_motor.run_to_rel_pos(
            position_sp=int(payload['degreeMove']), speed_sp=200)
        self.rotate_motor.wait_while('running')

        cardCount = 0
        print('cardCount')
        print(payload['cardCount'])
        while cardCount < int(payload['cardCount']):
            # deal a card
            self.deal_motor.stop_action = 'hold'
            self.deal_motor.run_to_rel_pos(position_sp=241, speed_sp=400)
            self.deal_motor.wait_while('running')
            cardCount += 1
            print('done once')
            time.sleep(0.3)
        self.rotate_motor.stop_action = 'hold'
        self.rotate_motor.run_to_rel_pos(
            position_sp=(int(payload['degreeMove'])) * -1, speed_sp=200)
        self.rotate_motor.wait_while('running')


if __name__ == '__main__':
    print('starting')
    # Startup sequence
    gadget = MindstormsCardDealerGadget()

    gadget.leds.set_color("LEFT", "ORANGE")
    gadget.leds.set_color("RIGHT", "ORANGE")

    # Gadget main entry point
    gadget.main()

    # Shutdown sequence
    gadget.sound.play_song((('E5', 'e'), ('C4', 'e')))
    gadget.leds.set_color("LEFT", "BLACK")
    gadget.leds.set_color("RIGHT", "BLACK")
